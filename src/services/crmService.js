// src/services/crmService.js
import { db } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { logSecurityEvent } from './rbacService';

const STORAGE_CRM_KEY = 'imperium_cds_crm_contacts';
const STORAGE_TDR_KEY = 'imperium_cds_tdr_projects';

/**
 * Ajoute un nouveau contact Partenaire ou Ambassadeur dans le CRM
 */
export const addCrmContact = async (contactData, user) => {
  const newContact = {
    ...contactData,
    dealValue: parseFloat(contactData.dealValue || 0),
    assignedTo: user?.uid || "user-uid",
    assignedToName: user?.displayName || user?.email || "Agent CDS",
    createdAt: new Date().toISOString()
  };

  try {
    const docRef = await addDoc(collection(db, 'crm_contacts'), newContact);
    await logSecurityEvent(user?.uid, 'CRM_CONTACT_ADDED', `Ajout contact CRM: ${newContact.name} (${newContact.type})`);
    return { id: docRef.id, ...newContact };
  } catch (e) {
    const localContact = { id: `CRM-${Date.now()}`, ...newContact };
    const current = getLocalCrmContacts();
    localStorage.setItem(STORAGE_CRM_KEY, JSON.stringify([localContact, ...current]));
    return localContact;
  }
};

/**
 * Récupère les contacts du CRM (État 0 : aucun contact par défaut)
 */
export const getCrmContacts = async () => {
  try {
    const q = query(collection(db, 'crm_contacts'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const list = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    return list;
  } catch (e) {
    console.warn("Erreur chargement CRM Firestore:", e);
    return getLocalCrmContacts();
  }
};

/**
 * Crée un nouveau Terme de Référence (TDR) de projet
 */
export const createTdrProject = async (tdrData, user) => {
  const newTdr = {
    ...tdrData,
    budget: parseFloat(tdrData.budget || 0),
    status: "pending_approval",
    createdBy: user?.uid || "user-uid",
    createdByName: user?.displayName || user?.email || "Responsable Opérations",
    createdAt: new Date().toISOString()
  };

  try {
    const docRef = await addDoc(collection(db, 'tdr_projects'), newTdr);
    await logSecurityEvent(user?.uid, 'TDR_CREATED', `Création TDR projet: ${newTdr.title}`);
    return { id: docRef.id, ...newTdr };
  } catch (e) {
    const localTdr = { id: `TDR-${Date.now()}`, ...newTdr };
    const current = getLocalTdrProjects();
    localStorage.setItem(STORAGE_TDR_KEY, JSON.stringify([localTdr, ...current]));
    return localTdr;
  }
};

/**
 * Récupère les projets TDR (État 0 : aucun projet par défaut)
 */
export const getTdrProjects = async () => {
  try {
    const q = query(collection(db, 'tdr_projects'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const list = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    return list;
  } catch (e) {
    console.warn("Erreur chargement TDR Firestore:", e);
    return getLocalTdrProjects();
  }
};

/**
 * Valide un TDR (DG ou CEO)
 */
export const approveTdrProject = async (tdrId, userId) => {
  try {
    const tdrRef = doc(db, 'tdr_projects', tdrId);
    await updateDoc(tdrRef, {
      status: 'approved',
      approvedBy: userId,
      approvedAt: new Date().toISOString()
    });
    await logSecurityEvent(userId, 'TDR_APPROVED', `Validation du TDR ${tdrId}`);
  } catch (e) {
    updateLocalTdrStatus(tdrId, 'approved', { approvedBy: userId });
  }
};

/**
 * Veto CEO irrévocable sur un TDR
 */
export const vetoTdrProject = async (tdrId, userId, vetoReason) => {
  try {
    const tdrRef = doc(db, 'tdr_projects', tdrId);
    await updateDoc(tdrRef, {
      status: 'vetoed',
      vetoedBy: userId,
      vetoReason: vetoReason || 'Non-conformité stratégique',
      vetoedAt: new Date().toISOString()
    });
    await logSecurityEvent(userId, 'TDR_VETOED', `VETO CEO sur TDR ${tdrId}: ${vetoReason}`);
  } catch (e) {
    updateLocalTdrStatus(tdrId, 'vetoed', { vetoedBy: userId, vetoReason });
  }
};

// STOCKAGE LOCAL HELPERS ÉTAT 0
const getLocalCrmContacts = () => {
  try {
    const data = localStorage.getItem(STORAGE_CRM_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {}
  return [];
};

const getLocalTdrProjects = () => {
  try {
    const data = localStorage.getItem(STORAGE_TDR_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {}
  return [];
};

const updateLocalTdrStatus = (tdrId, status, extra = {}) => {
  const current = getLocalTdrProjects();
  const updated = current.map(t => t.id === tdrId ? { ...t, status, ...extra } : t);
  localStorage.setItem(STORAGE_TDR_KEY, JSON.stringify(updated));
};
