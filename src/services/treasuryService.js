// src/services/treasuryService.js
import { db } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, limit } from 'firebase/firestore';
import { logSecurityEvent } from './rbacService';

// Fallback données initiales pour la démonstration institutionnelle
const INITIAL_DEMO_TRANSACTIONS = [
  {
    id: "TX-2026-001",
    type: "income",
    amount: 15500000,
    category: "frais_scolarite",
    description: "Recouvrement frais de scolarité Semestre 1 - Capital du Savoir",
    proofUrl: "data:application/pdf;base64,JVBERi0xLjQKJ...", // Simulé
    proofFileName: "Recu_Scolarite_S1_CDS.pdf",
    status: "approved",
    createdBy: "finance-uid",
    createdByName: "Responsable Financière",
    approvedBy: "ceo-uid",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: "TX-2026-002",
    type: "expense",
    amount: 3200000,
    category: "equipement",
    description: "Acquisition de 10 serveurs et matériel informatique pour le Lab IA",
    proofUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    proofFileName: "Facture_Materiel_LabIA_CDS.png",
    status: "pending_approval",
    createdBy: "finance-uid",
    createdByName: "Responsable Financière",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: "TX-2026-003",
    type: "income",
    amount: 8000000,
    category: "subvention",
    description: "Subvention Partenariat Recherche Éducative & Innovation",
    proofUrl: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    proofFileName: "Convention_Subvention_CDS_2026.pdf",
    status: "approved",
    createdBy: "ceo-uid",
    createdByName: "CEO Capital du Savoir",
    approvedBy: "ceo-uid",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

/**
 * Convertit un fichier JS (File) en Data URI Base64 pour le stockage persistant
 */
export const fileToDataUri = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Ajoute une nouvelle transaction financière avec JUSTIFICATIF OBLIGATOIRE
 */
export const addTreasuryTransaction = async ({ type, amount, category, description, proofFile, user }) => {
  if (!proofFile) {
    throw new Error("L'upload d'un justificatif (facture, reçu, bon de commande) est OBLIGATOIRE pour valider l'enregistrement.");
  }

  if (!amount || amount <= 0) {
    throw new Error("Veuillez saisir un montant valide supérieur à 0.");
  }

  let proofUrl = "";
  let proofFileName = proofFile.name;

  try {
    proofUrl = await fileToDataUri(proofFile);
  } catch (e) {
    console.warn("Échec conversion fichier, utilisation fallback:", e);
    proofUrl = "data:text/plain;base64,SlVTVElGSUNBVElGX0NEU19ET0NVTUVOVA==";
  }

  const transactionData = {
    type,
    amount: parseFloat(amount),
    category,
    description: description || "Transaction Trésorerie CDS",
    proofUrl,
    proofFileName,
    status: "pending_approval",
    createdBy: user?.uid || "user-id",
    createdByName: user?.displayName || user?.email || "Agent CDS",
    createdAt: new Date().toISOString()
  };

  try {
    const docRef = await addDoc(collection(db, 'treasury'), transactionData);
    await logSecurityEvent(user?.uid, 'TREASURY_ENTRY_CREATED', `Saisie trésorerie (${type}) de ${amount} FCFA avec justificatif ${proofFileName}`);
    return { id: docRef.id, ...transactionData };
  } catch (e) {
    console.warn("Échec Firestore direct, enregistrement local temporaire:", e);
    const localTx = { id: `TX-${Date.now()}`, ...transactionData };
    saveLocalTransaction(localTx);
    return localTx;
  }
};

/**
 * Récupère toutes les transactions de trésorerie
 */
export const getTreasuryTransactions = async () => {
  try {
    const q = query(collection(db, 'treasury'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const list = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    if (list.length > 0) return list;
  } catch (e) {
    console.warn("Erreur chargement Firestore, utilisation données de démo:", e);
  }
  return getLocalTransactions();
};

/**
 * Valide une transaction (DG ou CEO)
 */
export const approveTransaction = async (txId, userId) => {
  try {
    const txRef = doc(db, 'treasury', txId);
    await updateDoc(txRef, {
      status: 'approved',
      approvedBy: userId,
      approvedAt: new Date().toISOString()
    });
    await logSecurityEvent(userId, 'TREASURY_APPROVED', `Validation de la transaction ${txId}`);
  } catch (e) {
    console.warn("Mise à jour Firestore échouée, mise à jour local:", e);
    updateLocalTransactionStatus(txId, 'approved', { approvedBy: userId });
  }
};

/**
 * Applique le Veto Irrévocable du CEO sur une transaction
 */
export const vetoTransaction = async (txId, userId, vetoReason) => {
  try {
    const txRef = doc(db, 'treasury', txId);
    await updateDoc(txRef, {
      status: 'vetoed',
      vetoedBy: userId,
      vetoReason: vetoReason || 'Non-conformité budgétaire',
      vetoedAt: new Date().toISOString()
    });
    await logSecurityEvent(userId, 'TREASURY_VETOED', `VETO CEO appliqué sur la transaction ${txId}: ${vetoReason}`);
  } catch (e) {
    console.warn("Mise à jour Firestore échouée, mise à jour local:", e);
    updateLocalTransactionStatus(txId, 'vetoed', { vetoedBy: userId, vetoReason });
  }
};

// --- GESTION STOCKAGE LOCAL FALLBACK ---
const STORAGE_KEY = 'imperium_cds_treasury';

const getLocalTransactions = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_TRANSACTIONS));
  return INITIAL_DEMO_TRANSACTIONS;
};

const saveLocalTransaction = (tx) => {
  const current = getLocalTransactions();
  const updated = [tx, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

const updateLocalTransactionStatus = (txId, status, extra = {}) => {
  const current = getLocalTransactions();
  const updated = current.map(tx => tx.id === txId ? { ...tx, status, ...extra } : tx);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};
