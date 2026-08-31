// api/radar.js
import admin from 'firebase-admin';

// 1. INITIALISATION DU SNIPER (Avec sécurité)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // Astuce technique : Vercel modifie parfois les sauts de ligne, on s'assure qu'ils sont corrects
            privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
        })
    });
}

export default async function handler(req, res) {
    // SÉCURITÉ : On s'assure que seul NOTRE futur métronome (cron-job) peut déclencher ce tir
    if (req.query.key !== process.env.CRON_SECRET) {
        return res.status(401).json({ error: 'Accès refusé. Code secret invalide.' });
    }

    try {
        const db = admin.firestore();
        // On récupère toutes les cibles du radar
        const snapshot = await db.collection('radar').get();

        let tirsEffectues = 0;
        const missions = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            if (!data.time || !data.token || !data.timeZone) return;

            // 2. CALCUL DE L'HEURE LOCALE DE LA CIBLE
            // On convertit l'heure actuelle (serveur) dans le fuseau horaire exact de l'utilisateur
            const heureCibleActuelle = new Date().toLocaleTimeString('fr-FR', {
                timeZone: data.timeZone,
                hour: '2-digit',
                minute: '2-digit',
                hour12: false // Format 24h (ex: "20:00")
            });

            // 3. VÉRIFICATION ET TIR
            if (heureCibleActuelle === data.time) {
                const message = {
                    notification: {
                        title: 'QG IMPERIUM',
                        body: 'Commandant, il est l\'heure de faire le bilan. L\'ennemi ne dort jamais.'
                    },
                    token: data.token,
                };
                // On prépare le tir
                missions.push(admin.messaging().send(message));
                tirsEffectues++;
            }
        });

        // On exécute tous les tirs en même temps
        await Promise.all(missions);

        // Rapport de mission
        res.status(200).json({ success: true, ciblesAbattues: tirsEffectues });
        
    } catch (error) {
        console.error("Erreur du Sniper :", error);
        res.status(500).json({ error: error.message });
    }
}