import React, { useState, useEffect } from 'react';
import HeaderNav from './components/ui/HeaderNav';
import LoginScreen from './components/auth/LoginScreen';
import PegazusManager from './components/pegazus/PegazusManager';
import CitadelleManager from './components/citadelle/CitadelleManager';
import RadioQGManager from './components/radioQG/RadioQGManager';
import ArsenalManager from './components/arsenal/ArsenalManager';
import JarvisAssistant from './components/jarvis/JarvisAssistant';
import RoleGuard from './components/auth/RoleGuard';
import { auth, loginWithGoogle, logoutUser } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserProfile } from './services/rbacService';
import { createTdrProject } from './services/crmService';
import { Sparkles, Shield, Loader2 } from './components/ui/Icons';
import { hasPermission } from './config/roles';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('citadelle');

  useEffect(() => {
    // Écoute de l'état d'authentification Firebase
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);
      if (user) {
        try {
          const profile = await getUserProfile(user);
          setCurrentUser(profile);
          // Choisir l'onglet approprié selon les permissions de l'utilisateur
          if (hasPermission(profile.role, 'view_citadelle')) {
            setActiveTab('citadelle');
          } else if (hasPermission(profile.role, 'view_radio_qg')) {
            setActiveTab('radio_qg');
          } else if (hasPermission(profile.role, 'view_arsenal')) {
            setActiveTab('arsenal');
          } else if (hasPermission(profile.role, 'use_jarvis')) {
            setActiveTab('jarvis');
          } else {
            setActiveTab('radio_qg');
          }
        } catch (e) {
          console.error("Erreur chargement profil:", e);
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setLoginLoading(true);
    setLoginError('');
    try {
      const user = await loginWithGoogle();
      if (user) {
        const profile = await getUserProfile(user);
        setCurrentUser(profile);
      }
    } catch (e) {
      console.error("Erreur connexion Google:", e);
      setLoginError(e.message || "Impossible de se connecter via Google. Veuillez réessayer.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn("Erreur déconnexion:", e);
    }
    setCurrentUser(null);
  };

  const handleRoleChange = (newRole) => {
    setCurrentUser(prev => ({ ...prev, role: newRole }));
  };

  const handleSendTdrToArsenal = async (tdrData) => {
    try {
      await createTdrProject(tdrData, currentUser);
      alert("✅ Le TDR généré par Jarvis IA a été transféré avec succès dans le module Arsenal !");
      setActiveTab('arsenal');
    } catch (e) {
      alert("Erreur lors du transfert vers Arsenal : " + e.message);
    }
  };

  // ── ÉCRAN DE CHARGEMENT INITIAL (SPLASH) ──
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A1128] flex flex-col items-center justify-center p-4 text-white">
        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/20 mb-4 animate-pulse">
          <Shield className="w-10 h-10 text-[#0A1128]" />
        </div>
        <h2 className="text-lg font-black uppercase tracking-widest font-serif text-white">
          Imperium-CDS-Edition
        </h2>
        <p className="text-xs text-gray-500 font-mono mt-1">Vérification de session sécurisée...</p>
        <Loader2 className="w-5 h-5 animate-spin text-amber-400 mt-4" />
      </div>
    );
  }

  // ── ÉTAT 0 : NON CONNECTÉ → ÉCRAN DE CONNEXION OFFICIEL ──
  if (!currentUser) {
    return (
      <LoginScreen
        onGoogleLogin={handleGoogleLogin}
        loading={loginLoading}
        error={loginError}
      />
    );
  }

  // ── ÉTAT CONNECTÉ : APPLICATION OFFICIELLE ──
  return (
    <div className="min-h-screen bg-[#0A1128] text-slate-100 font-sans selection:bg-amber-500 selection:text-black">

      {/* BARRE DE NAVIGATION INSTITUTIONNELLE */}
      <HeaderNav
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onOpenPegazus={() => setActiveTab('pegazus')}
      />

      {/* BANDEAU INSTITUTIONNEL OFFICIEL */}
      <div className="bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-amber-500/10 border-b border-cyan-500/20 px-4 py-1.5 text-center text-[11px] font-mono text-cyan-300 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>
          <strong>Imperium-CDS-Edition</strong> · Capital du Savoir — Audace · Innovation · Vision · Note N°0002
        </span>
      </div>

      {/* CONTENU PRINCIPAL PAR MODULE */}
      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* MODULE 1 : PÉGAZUS IAM (CEO / DG) */}
        {activeTab === 'pegazus' && (
          <RoleGuard userRole={currentUser.role} requiredPermission="view_pegazus">
            <PegazusManager
              currentUser={currentUser}
              onRoleChange={handleRoleChange}
              onBack={() => setActiveTab('citadelle')}
            />
          </RoleGuard>
        )}

        {/* MODULE 2 : CITADELLE (DIRECTION & FINANCES) */}
        {activeTab === 'citadelle' && (
          <RoleGuard userRole={currentUser.role} requiredPermission="view_citadelle">
            <CitadelleManager currentUser={currentUser} />
          </RoleGuard>
        )}

        {/* MODULE 3 : RADIO QG (SECRÉTARIAT GÉNÉRAL & RAPPORTS) */}
        {activeTab === 'radio_qg' && (
          <RoleGuard userRole={currentUser.role} requiredPermission="view_radio_qg">
            <RadioQGManager currentUser={currentUser} />
          </RoleGuard>
        )}

        {/* MODULE 4 : ARSENAL (OPÉRATIONS & LOGISTIQUE & TDR) */}
        {activeTab === 'arsenal' && (
          <RoleGuard userRole={currentUser.role} requiredPermission="view_arsenal">
            <ArsenalManager currentUser={currentUser} />
          </RoleGuard>
        )}

        {/* MODULE 5 : JARVIS IA (COMMUNICATION & TDR AI) */}
        {activeTab === 'jarvis' && (
          <RoleGuard userRole={currentUser.role} requiredPermission="use_jarvis">
            <JarvisAssistant
              currentUser={currentUser}
              onSendTdrToArsenal={handleSendTdrToArsenal}
            />
          </RoleGuard>
        )}
      </main>
    </div>
  );
}