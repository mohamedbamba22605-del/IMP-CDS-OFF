// src/services/reportingService.js
import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, query, orderBy } from 'firebase/firestore';
import { logSecurityEvent } from './rbacService';
import { fileToDataUri } from './treasuryService';

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
 * Récupère tous les rapports triennaux (État 0 : aucun rapport par défaut)
 */
export const getTriennialReports = async () => {
  try {
    const q = query(collection(db, 'reports'), orderBy('submittedAt', 'desc'));
    const snap = await getDocs(q);
    const list = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    return list;
  } catch (e) {
    console.warn("Erreur chargement rapports Firestore:", e);
    return getLocalReports();
  }
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
 * Récupère les archives sécurisées (PV & Notes) (État 0 : aucune archive par défaut)
 */
export const getArchiveDocuments = async () => {
  try {
    const q = query(collection(db, 'archives'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const list = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    return list;
  } catch (e) {
    console.warn("Erreur chargement archives Firestore:", e);
    return getLocalArchives();
  }
};

// HELPERS DE STOCKAGE LOCAL ÉTAT 0
const getLocalReports = () => {
  try {
    const data = localStorage.getItem(STORAGE_REPORTS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {}
  return [];
};

const getLocalArchives = () => {
  try {
    const data = localStorage.getItem(STORAGE_ARCHIVES_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {}
  return [];
};
