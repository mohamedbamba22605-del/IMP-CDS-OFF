// public/firebase-messaging-sw.js
// --- LE SOLDAT DE L'OMBRE FIREBASE ---

// 1. On importe les outils Firebase spécialement conçus pour l'arrière-plan
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// 2. ⚠️ CONFIGURATION FIREBASE (en production, utilisez importScripts pour charger depuis env)
// Pour le développement local, les valeurs par défaut sont utilisées
const firebaseConfig = {
    apiKey: "AIzaSyC_gXxWHFBnIl6z2U26cNp0gzgY5DkiRcs",
    authDomain: "imperium-v2-a2ba1.firebaseapp.com",
    projectId: "imperium-v2-a2ba1",
    storageBucket: "imperium-v2-a2ba1.firebasestorage.app",
    messagingSenderId: "688896103671",
    appId: "1:688896103671:web:7a80ae9168765891d56ff2"
};

// 3. Initialisation
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 4. L'intercepteur de signaux (Quand l'app est fermée)
messaging.onBackgroundMessage((payload) => {
  console.log('[QG Arrière-plan] Signal Firebase reçu :', payload);

  const notificationTitle = payload.notification.title || "Message du QG";
  const notificationOptions = {
    body: payload.notification.body || "Nouvelle directive disponible.",
    icon: '/icon.png',
    badge: '/icon.png',
  };

  // On force l'affichage de la notification sur le téléphone
  self.registration.showNotification(notificationTitle, notificationOptions);
});