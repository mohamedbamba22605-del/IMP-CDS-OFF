// src/services/crmService.js
import { db } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { logSecurityEvent } from './rbacService';

// Contacts CRM de démonstration pour Capital du Savoir
const DEMO_CRM_CONTACTS = [
  {
    id: "CRM-2026-001",
    name: "Dr. Aminata Diallo",
    type: "partner",
    organization: "Fondation Innovation & Éducation",
    email: "a.diallo@innoveduc.org",
    phone: "+221 77 123 45 67",
    status: "active",
    notes: "Partenaire clé pour la fourniture des bourses d'études et le matériel informatique.",
    dealValue: 25000000,
    assignedToName: "Responsable Opérations",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
  },
  {
    id: "CRM-2026-002",
    name: "Marc Antoine Moreau",
    type: "ambassador",
    organization: "Réseau Ambassadeurs CDS - Paris",
    email: "m.moreau@ambassadeurs-cds.org",
    phone: "+33 6 98 76 54 32",
    status: "active",
    notes: "Ambassadeur d'honneur chargé du rayonnement international et du recrutement étudiant.",
    dealValue: 0,
    assignedToName: "Responsable Opérations",
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString()
  },
  {
    id: "CRM-2026-003",
    name: "Société Tech&Savoir S.A.",
    type: "sponsor",
    organization: "Tech&Savoir",
    email: "contact@techsavoir.com",
    phone: "+226 25 30 00 11",
    status: "prospect",
    notes: "Projet de sponsoring pour la compétition de hacking et d'IA académique.",
    dealValue: 10000000,
    assignedToName: "Responsable Opérations",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  }
];

// Termes de Référence (TDR) de projets de démonstration
const DEMO_TDR_PROJECTS = [
  {
    id: "TDR-2026-001",
    title: "TDR - Organisation du Hackathon National IA & Éducation 2026",
    context: "Dans le cadre de l'expansion du Pôle Innovation de Capital du Savoir, cet événement vise à réunir 200 étudiants et chercheurs.",
    objectives: "Stimuler l'innovation pédagogique, concevoir 5 prototypes d'IA éducatives et signer 3 nouveaux partenariats.",
    targetAudience: "Étudiants en Informatique, Enseignants-Chercheurs et Entreprises Tech.",
    budget: 8500000,
    timeline: "15 Octobre 2026 - 18 Octobre 2026",
    deliverables: [
      "5 applications IA fonctionnelles",
      "Rapport final d'évaluation et de presse",
      "Convention de stage pour les 3 équipes gagnantes"
    ],
    status: "pending_approval",
    createdBy: "ops-uid",
    createdByName: "Responsable Opérations & Logistique",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "TDR-2026-002",
    title: "TDR - Digitalisation Intégrale de la Bibliothèque Pédagogique",
    context: "Mise en place d'une plateforme d'accès en ligne aux manuels scolaires et publications pour tous les étudiants CDS.",
    objectives: "Acquérir 1000 licences d'ouvrages numériques et déployer un serveur de consultation sécurisé.",
    targetAudience: "Ensemble de la communauté éducative Capital du Savoir.",
    budget: 12000000,
    timeline: "01 Septembre 2026 - 30 Novembre 2026",
    deliverables: [
      "Plateforme web E-Library CDS opérationnelle",
      "Catalogue de 1000 livres indexés"
    ],
    status: "approved",
    createdBy: "secgen-uid",
    createdByName: "Secrétaire Général",
    approvedBy: "ceo-uid",
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString()
  }
];

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
 * Récupère les contacts du CRM
 */
export const getCrmContacts = async () => {
  try {
    const q = query(collection(db, 'crm_contacts'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const list = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    if (list.length > 0) return list;
  } catch (e) {
    console.warn("Utilisation contacts CRM démo locaux:", e);
  }
  return getLocalCrmContacts();
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
 * Récupère les projets TDR
 */
export const getTdrProjects = async () => {
  try {
    const q = query(collection(db, 'tdr_projects'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const list = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    if (list.length > 0) return list;
  } catch (e) {
    console.warn("Utilisation TDR démo locaux:", e);
  }
  return getLocalTdrProjects();
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

// STOCKAGE LOCAL HELPERS
const getLocalCrmContacts = () => {
  try {
    const data = localStorage.getItem(STORAGE_CRM_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {}
  localStorage.setItem(STORAGE_CRM_KEY, JSON.stringify(DEMO_CRM_CONTACTS));
  return DEMO_CRM_CONTACTS;
};

const getLocalTdrProjects = () => {
  try {
    const data = localStorage.getItem(STORAGE_TDR_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {}
  localStorage.setItem(STORAGE_TDR_KEY, JSON.stringify(DEMO_TDR_PROJECTS));
  return DEMO_TDR_PROJECTS;
};

const updateLocalTdrStatus = (tdrId, status, extra = {}) => {
  const current = getLocalTdrProjects();
  const updated = current.map(t => t.id === tdrId ? { ...t, status, ...extra } : t);
  localStorage.setItem(STORAGE_TDR_KEY, JSON.stringify(updated));
};
