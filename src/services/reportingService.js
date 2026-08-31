// src/services/reportingService.js
import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, query, orderBy, limit } from 'firebase/firestore';
import { logSecurityEvent } from './rbacService';
import { fileToDataUri } from './treasuryService';

// Données de démo initiales pour les rapports triennaux
const DEMO_REPORTS = [
  {
    id: "REP-2026-001",
    periodStart: "2026-08-25",
    periodEnd: "2026-08-28",
    authorId: "secgen-uid",
    authorName: "Secrétaire Général",
    authorRole: "SECRETAIRE_GENERAL",
    department: "Secrétariat Général",
    summary: "Rapport d'activité triennal sur la finalisation des inscriptions et la préparation de la rentrée académique.",
    achievements: [
      "Validation de 145 dossiers d'inscription des nouveaux apprenants",
      "Organisation de la réunion préparatoire avec la Direction des Études",
      "Archivage des 3 derniers PV de conseils de discipline"
    ],
    blockers: [
      "Retard de livraison des badges magnétiques étudiants par le fournisseur"
    ],
    nextActions: [
      "Relance du fournisseur pour les badges d'accès au campus",
      "Rédaction de la Note de Service N°04 sur le règlement intérieur"
    ],
    submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: "submitted"
  },
  {
    id: "REP-2026-002",
    periodStart: "2026-08-22",
    periodEnd: "2026-08-25",
    authorId: "ops-uid",
    authorName: "Responsable Opérations & Logistique",
    authorRole: "RESPONSABLE_OPERATIONS",
    department: "Opérations",
    summary: "Bilan logistique et maintenance des installations pédagogiques.",
    achievements: [
      "Installation du nouveau réseau WiFi Haute Performance dans l'Amphi 1",
      "Audit des 25 postes informatiques du Laboratoire IA"
    ],
    blockers: [],
    nextActions: [
      "Commande des vidéoprojecteurs de rechange"
    ],
    submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: "submitted"
  }
];

// Données de démo pour les Procès-Verbaux (PV) et Notes de Service
const DEMO_ARCHIVES = [
  {
    id: "ARCH-2026-001",
    title: "Procès-Verbal du Conseil d'Administration N°12",
    type: "PV",
    category: "Gouvernance",
    fileName: "PV_Conseil_Administration_CDS_2026.pdf",
    fileUrl: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    contentSummary: "Délibération sur le budget prévisionnel 2026-2027 et l'extension du campus.",
    createdBy: "secgen-uid",
    createdByName: "Secrétaire Général",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: "ARCH-2026-002",
    title: "Note de Service N°03 - Directive Sécurité & Assiduité",
    type: "NOTE_SERVICE",
    category: "Règlement Interne",
    fileName: "Note_Service_03_CDS.pdf",
    fileUrl: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    contentSummary: "Règles d'accès aux locaux et obligation de soumission des rapports triennaux.",
    createdBy: "ceo-uid",
    createdByName: "CEO Capital du Savoir",
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString()
  }
];

const STORAGE_REPORTS_KEY = 'imperium_cds_reports';
const STORAGE_ARCHIVES_KEY = 'imperium_cds_archives';

/**
 * Enregistre un nouveau rapport triennal (obligatoire tous les 3 jours)
 */
export const submitTriennialReport = async (reportData, user) => {
  const newReport = {
    ...reportData,
    authorId: user?.uid || "user-uid",
    authorName: user?.displayName || user?.email || "Responsable CDS",
    authorRole: user?.role || "RESPONSABLE",
    submittedAt: new Date().toISOString(),
    status: "submitted"
  };

  try {
    const docRef = await addDoc(collection(db, 'reports'), newReport);
    await logSecurityEvent(user?.uid, 'REPORT_SUBMITTED', `Soumission du rapport triennal par ${newReport.authorName}`);
    return { id: docRef.id, ...newReport };
  } catch (e) {
    console.warn("Échec Firestore direct, fallback local:", e);
    const localRep = { id: `REP-${Date.now()}`, ...newReport };
    const current = getLocalReports();
    localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify([localRep, ...current]));
    return localRep;
  }
};

/**
 * Récupère tous les rapports triennaux
 */
export const getTriennialReports = async () => {
  try {
    const q = query(collection(db, 'reports'), orderBy('submittedAt', 'desc'));
    const snap = await getDocs(q);
    const list = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    if (list.length > 0) return list;
  } catch (e) {
    console.warn("Utilisation rapports démo locaux:", e);
  }
  return getLocalReports();
};

/**
 * Ajoute un document archivé (PV, Note de Service, Compte Rendu)
 */
export const addArchiveDocument = async ({ title, type, category, contentSummary, file, user }) => {
  if (!file) {
    throw new Error("Veuillez joindre le document PDF ou image à archiver.");
  }

  let fileUrl = "";
  try {
    fileUrl = await fileToDataUri(file);
  } catch (e) {
    fileUrl = "data:text/plain;base64,SlVTVElGSUNBVElGX0NEUw==";
  }

  const archiveData = {
    title,
    type: type || "PV",
    category: category || "Administratif",
    contentSummary: contentSummary || "",
    fileName: file.name,
    fileUrl,
    createdBy: user?.uid || "user-uid",
    createdByName: user?.displayName || user?.email || "Agent CDS",
    createdAt: new Date().toISOString()
  };

  try {
    const docRef = await addDoc(collection(db, 'archives'), archiveData);
    await logSecurityEvent(user?.uid, 'ARCHIVE_ADDED', `Archivage document: ${title} (${type})`);
    return { id: docRef.id, ...archiveData };
  } catch (e) {
    const localArch = { id: `ARCH-${Date.now()}`, ...archiveData };
    const current = getLocalArchives();
    localStorage.setItem(STORAGE_ARCHIVES_KEY, JSON.stringify([localArch, ...current]));
    return localArch;
  }
};

/**
 * Récupère les archives sécurisées (PV & Notes)
 */
export const getArchiveDocuments = async () => {
  try {
    const q = query(collection(db, 'archives'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const list = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    if (list.length > 0) return list;
  } catch (e) {
    console.warn("Utilisation archives démo locales:", e);
  }
  return getLocalArchives();
};

// HELPERS DE STOCKAGE LOCAL
const getLocalReports = () => {
  try {
    const data = localStorage.getItem(STORAGE_REPORTS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {}
  localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(DEMO_REPORTS));
  return DEMO_REPORTS;
};

const getLocalArchives = () => {
  try {
    const data = localStorage.getItem(STORAGE_ARCHIVES_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {}
  localStorage.setItem(STORAGE_ARCHIVES_KEY, JSON.stringify(DEMO_ARCHIVES));
  return DEMO_ARCHIVES;
};
