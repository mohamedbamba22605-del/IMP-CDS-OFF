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
import { Sparkles, Shield, Loader2, Clock, LogOut, RefreshCw } from './components/ui/Icons';
import { hasPermission, ROLES } from './config/roles';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('citadelle');

  const fetchProfile = async (firebaseUser) => {
    try {
      const profile = await getUserProfile(firebaseUser);
      setCurrentUser(profile);

      // Définir l'onglet par défaut selon le rôle
      if (profile.role === 'DIRECTEUR_GENERAL' || profile.role === 'CEO') {
        setActiveTab('pegazus'); // Ouvre directement Pégazus pour que le DG puisse gérer les effectifs
      } else if (hasPermission(profile.role, 'view_citadelle')) {
        setActiveTab('citadelle');
      } else if (hasPermission(profile.role, 'view_radio_qg')) {
        setActiveTab('radio_qg');
      } else if (hasPermission(profile.role, 'view_arsenal')) {
        setActiveTab('arsenal');
      } else if (hasPermission(profile.role, 'use_jarvis')) {
        setActiveTab('jarvis');
      }
    } catch (e) {
      console.error("Erreur chargement profil:", e);
    }
  };

  useEffect(() => {
    // Écoute de l'état d'authentification Firebase
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);
      if (user) {
        await fetchProfile(user);
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
        await fetchProfile(user);
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

  const handleRefreshMyProfile = async () => {
    if (auth.currentUser) {
      setAuthLoading(true);
      await fetchProfile(auth.currentUser);
      setAuthLoading(false);
    }
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

  // ── ÉTAT : COMPTE EN ATTENTE D'AFFECTATION PAR LE DG / CEO ──
  if (currentUser.role === 'EN_ATTENTE') {
    return (
      <div className="min-h-screen bg-[#0A1128] flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full p-8 bg-[#0B192C]/90 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <span className="px-3 py-1 bg-gray-700/40 text-gray-300 border border-gray-600 rounded-full text-[10px] font-mono font-bold uppercase">
              Compte Enregistré
            </span>
            <h2 className="text-xl font-bold uppercase tracking-wider text-white font-serif mt-3">
              En Attente d'Affectation
            </h2>
            <p className="text-xs text-gray-400 font-mono mt-1">
              Bienvenue, <strong className="text-white">{currentUser.displayName || currentUser.email}</strong>
            </p>
          </div>

          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs text-gray-300 leading-relaxed text-left font-sans space-y-2">
            <p>
              Votre compte a été créé avec succès sur la plateforme officielle de <strong>Capital du Savoir</strong>.
            </p>
            <p className="text-gray-400 font-mono text-[11px]">
              Conformément à la Note d'Information N° 0002, le <strong>Directeur Général</strong> ou le <strong>CEO</strong> doit valider votre nomination à l'un des 12 postes officiels pour débloquer vos accès.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRefreshMyProfile}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase font-mono rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-700"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Vérifier mon statut</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs uppercase font-mono rounded-xl transition-all border border-red-500/30 flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── ÉTAT CONNECTÉ ET NOMMÉ : APPLICATION ERP OFFICIELLE ──
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

        {/* MODULE 1 : PÉGAZUS IAM (DG & CEO) */}
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