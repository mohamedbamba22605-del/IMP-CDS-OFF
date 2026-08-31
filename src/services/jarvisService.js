// src/services/jarvisService.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const MONTHLY_QUOTA_LIMIT = 100;

/**
 * Obtient le quota actuel de l'utilisateur pour le mois en cours depuis Firestore
 */
export const getUserQuota = async (userId) => {
  if (!userId) return { count: 0, limit: MONTHLY_QUOTA_LIMIT, remaining: MONTHLY_QUOTA_LIMIT };

  const currentMonth = new Date().toISOString().slice(0, 7); // ex: "2026-08"
  const quotaDocId = `${userId}_${currentMonth}`;

  try {
    const quotaRef = doc(db, 'jarvis_quotas', quotaDocId);
    const snap = await getDoc(quotaRef);

    if (snap.exists()) {
      const data = snap.data();
      return {
        count: data.count || 0,
        limit: data.limit || MONTHLY_QUOTA_LIMIT,
        remaining: Math.max(0, (data.limit || MONTHLY_QUOTA_LIMIT) - (data.count || 0))
      };
    } else {
      const newQuota = {
        uid: userId,
        month: currentMonth,
        count: 0,
        limit: MONTHLY_QUOTA_LIMIT,
        lastUpdated: new Date().toISOString()
      };
      await setDoc(quotaRef, newQuota);
      return { count: 0, limit: MONTHLY_QUOTA_LIMIT, remaining: MONTHLY_QUOTA_LIMIT };
    }
  } catch (e) {
    console.warn("Utilisation fallback quota local:", e);
    const localCount = parseInt(localStorage.getItem(`jarvis_quota_${quotaDocId}`) || '0');
    return {
      count: localCount,
      limit: MONTHLY_QUOTA_LIMIT,
      remaining: Math.max(0, MONTHLY_QUOTA_LIMIT - localCount)
    };
  }
};

/**
 * Incrémente le quota Firestore avant d'effectuer un appel IA
 */
export const consumeQuota = async (userId) => {
  if (!userId) return true;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const quotaDocId = `${userId}_${currentMonth}`;

  const currentQuota = await getUserQuota(userId);
  if (currentQuota.remaining <= 0) {
    throw new Error(`Quota mensuel IA atteint (${MONTHLY_QUOTA_LIMIT}/${MONTHLY_QUOTA_LIMIT} requêtes). Veuillez réinventer un abonnement ou attendre le mois prochain.`);
  }

  try {
    const quotaRef = doc(db, 'jarvis_quotas', quotaDocId);
    await updateDoc(quotaRef, {
      count: increment(1),
      lastUpdated: new Date().toISOString()
    });
  } catch (e) {
    const localKey = `jarvis_quota_${quotaDocId}`;
    const localCount = parseInt(localStorage.getItem(localKey) || '0') + 1;
    localStorage.setItem(localKey, localCount.toString());
  }

  return true;
};

/**
 * Générateur de TDR (Termes de Référence) assisté par IA
 */
export const generateTdrWithAi = async (topic, userId) => {
  await consumeQuota(userId);

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Tu es Jarvis, l'assistant IA institutionnel de "Capital du Savoir" (structure éducative de premier plan). 
Rédige un Terme de Référence (TDR) complet, hautement professionnel et structuré sur le sujet suivant : "${topic}".
Structure la réponse au format JSON strict suivant sans balises markdown superflues:
{
  "title": "Titre officiel du TDR",
  "context": "Contexte et justification du projet...",
  "objectives": "Objectifs généraux et spécifiques...",
  "targetAudience": "Public cible et bénéficiaires...",
  "budget": 5000000,
  "timeline": "Durée et calendrier...",
  "deliverables": ["Livrable 1", "Livrable 2", "Livrable 3"]
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.warn("Échec appel Gemini direct, génération intelligente locale:", e);
    }
  }

  // Fallback intelligent optimisé pour Capital du Savoir
  return {
    title: `TDR - ${topic.toUpperCase()} (Capital du Savoir)`,
    context: `Dans le cadre des orientations stratégiques de l'institution Capital du Savoir, le projet "${topic}" vise à répondre aux exigences académiques et opérationnelles actuelles.`,
    objectives: `1. Déployer les infrastructures nécessaires pour ${topic}.\n2. Assurer la formation et l'accompagnement des participants.\n3. Évaluer l'impact institutionnel et pérenniser les acquis.`,
    targetAudience: "Étudiants, Enseignants-Chercheurs et Personnel Administratif de Capital du Savoir",
    budget: 6500000,
    timeline: "30 jours à compter de la validation exécutive par le CEO",
    deliverables: [
      `Rapport initial de cadrage pour ${topic}`,
      "Guide d'implémentation opérationnelle et supports de formation",
      "Procès-Verbal de recette finale et bilan d'impact"
    ]
  };
};

/**
 * Générateur de Posts Réseaux Sociaux assisté par IA
 */
export const generateSocialPostWithAi = async (platform, topic, targetAudience, userId) => {
  await consumeQuota(userId);

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Tu es le Community Manager IA de "Capital du Savoir" (institution éducative).
Rédige un post percutant et engageant pour la plateforme ${platform} sur le thème : "${topic}".
Public cible : "${targetAudience || 'Étudiants et professionnels'}".
Inclus des émojis pertinents, des hashtags institutionnels (#CapitalDuSavoir #Éducation #Excellence) et un appel à l'action clair.`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (e) {
      console.warn("Échec appel Gemini direct, génération locale:", e);
    }
  }

  // Fallback intelligent par plateforme
  const hashtags = "#CapitalDuSavoir #ExcellenceÉducative #Innovation #Rentrée2026";
  if (platform === 'linkedin') {
    return `🎓 [COMMUNIQUÉ INSTITUTIONNEL - CAPITAL DU SAVOIR] 🎓\n\nNous avons le plaisir de vous annoncer notre nouvelle initiative : ${topic} !\n\nAu sein de Capital du Savoir, nous croyons fermement que l'éducation d'excellence et l'innovation sont les piliers fondamentaux de la réussite.\n\n✨ Ce que cette opportunité apporte à nos apprenants :\n• Développement de compétences de pointe\n• Encadrement par des experts chevronnés\n• Opportunités de réseau et d'insertion professionnelle\n\n📌 Rejoignez la dynamique dès aujourd'hui !\n🔗 En savoir plus et postuler : https://capitaldusavoir.org\n\n${hashtags}`;
  } else if (platform === 'facebook') {
    return `🚀 EXCELLENCE & AVENIR CHEZ CAPITAL DU SAVOIR ! 🚀\n\nDécouvrez notre tout dernier projet : ${topic} !\n\nRejoignez une communauté éducative dynamique et préparez votre succès de demain.\n\n👉 Inscriptions ouvertes dès maintenant sur notre plateforme !\n\n${hashtags}`;
  } else {
    return `🎓 Capital du Savoir innove ! Découvrez : ${topic}.\nL'excellence à votre portée. 🚀\n👉 Rejoignez-nous : https://capitaldusavoir.org\n\n${hashtags}`;
  }
};
