// src/services/rbacService.js
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, addDoc, query, orderBy, limit } from 'firebase/firestore';
import { ROLES, DEFAULT_ROLE } from '../config/roles';

/**
 * Récupère ou crée le profil utilisateur Firestore avec son rôle institutionnel
 */
export const getUserProfile = async (user) => {
  if (!user || !user.uid) return null;
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    } else {
      // Vérifier si des utilisateurs existent déjà dans Firestore
      let initialRole = 'EN_ATTENTE';
      let initialDept = 'Non affecté';

      try {
        const allUsersSnap = await getDocs(collection(db, 'users'));
        if (allUsersSnap.empty) {
          // Premier utilisateur qui lance la production : DIRECTEUR_GENERAL
          initialRole = 'DIRECTEUR_GENERAL';
          initialDept = 'Direction Générale';
        }
      } catch (e) {
        console.warn("Vérification existence users Firestore:", e);
      }

      const newProfile = {
        uid: user.uid,
        email: user.email || 'officier@capitaldusavoir.org',
        displayName: user.displayName || user.email?.split('@')[0] || 'Officier CDS',
        photoURL: user.photoURL || null,
        role: initialRole,
        department: initialDept,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      await setDoc(userRef, newProfile);
      await logSecurityEvent(user.uid, 'USER_REGISTERED', `Enregistrement du compte ${user.email} avec le rôle ${initialRole}`);
      return newProfile;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du profil utilisateur:", error);
    return {
      uid: user.uid,
      email: user.email || 'officier@capitaldusavoir.org',
      displayName: user.displayName || 'Officier CDS',
      role: 'EN_ATTENTE',
      department: 'Non affecté',
      status: 'active'
    };
  }
};

/**
 * Met à jour le rôle d'un utilisateur (Réservé au DG et au CEO)
 */
export const updateUserRole = async (targetUid, newRole, updatedByUid) => {
  try {
    const userRef = doc(db, 'users', targetUid);
    const roleInfo = ROLES[newRole];
    await updateDoc(userRef, {
      role: newRole,
      department: roleInfo?.label || newRole,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedByUid
    });
    
    await logSecurityEvent(
      updatedByUid, 
      'ROLE_UPDATED', 
      `Nomination de l'utilisateur ${targetUid} au poste : ${newRole}`
    );
    return true;
  } catch (error) {
    console.error("Erreur mise à jour rôle:", error);
    throw error;
  }
};

/**
 * Récupère tous les utilisateurs enregistrés dans Firestore
 */
export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    // Trier par date d'inscription
    users.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return users;
  } catch (error) {
    console.error("Erreur récupération utilisateurs:", error);
    return [];
  }
};

/**
 * Enregistre un événement dans la collection de journaux de sécurité `security_logs`
 */
export const logSecurityEvent = async (userId, eventType, description) => {
  try {
    await addDoc(collection(db, 'security_logs'), {
      userId: userId || 'anonymous',
      eventType: eventType,
      description: description,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.warn("Échec écriture log de sécurité:", e);
  }
};

/**
 * Récupère les récents événements de sécurité
 */
export const getSecurityLogs = async (maxLogs = 20) => {
  try {
    const logsRef = collection(db, 'security_logs');
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(maxLogs));
    const snap = await getDocs(q);
    const logs = [];
    snap.forEach(d => logs.push({ id: d.id, ...d.data() }));
    return logs;
  } catch (e) {
    console.warn("Impossible de charger les logs Firestore:", e);
    return [];
  }
};
