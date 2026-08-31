// src/components/auth/LoginScreen.jsx
import React, { useState } from 'react';
import { Shield, Sparkles, Lock, AlertTriangle, Loader2 } from '../ui/Icons';

export default function LoginScreen({ onGoogleLogin, loading, error }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A1128] flex items-center justify-center p-4 relative overflow-hidden">

      {/* ── Arrière-plan animé ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/3 rounded-full blur-3xl" />
        {/* Grille de fond */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* ── Carte de connexion ── */}
      <div className="relative z-10 w-full max-w-md">

        {/* En-tête institutionnel */}
        <div className="text-center mb-8">
          {/* Logo CDS */}
          <div className="w-24 h-24 mx-auto mb-5 relative">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/30 border border-amber-300/30">
              <Shield className="w-12 h-12 text-[#0A1128]" />
            </div>
            {/* Badge PWA */}
            <div className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-cyan-500 rounded-full text-[9px] font-black text-black font-mono shadow-lg">
              PWA
            </div>
          </div>

          <h1 className="text-3xl font-black text-white uppercase tracking-widest font-serif mb-1">
            Imperium
          </h1>
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-400" />
            <span className="text-amber-400 font-mono font-bold text-xs tracking-widest uppercase">CDS-Edition</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-400" />
          </div>

          <p className="text-gray-400 text-xs tracking-wider font-mono">
            CAPITAL DU SAVOIR · ERP INSTITUTIONNEL v18.0
          </p>
          <p className="text-gray-600 text-[10px] tracking-widest font-mono mt-1">
            AUDACE · INNOVATION · VISION
          </p>
        </div>

        {/* Carte principale */}
        <div className="bg-[#0B192C]/90 backdrop-blur-xl border border-amber-500/20 rounded-3xl p-8 shadow-2xl shadow-black/50">

          {/* Titre section */}
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white font-mono">
              Accès Sécurisé Pégazus IAM
            </h2>
          </div>

          {/* Message informatif */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl mb-6 space-y-2">
            <p className="text-xs text-gray-300 leading-relaxed">
              L'accès à l'ERP est réservé aux membres officiellement enregistrés de <span className="text-amber-400 font-bold">Capital du Savoir</span>.
            </p>
            <p className="text-xs text-gray-500 leading-relaxed font-mono">
              Votre rôle institutionnel sera attribué par le CEO ou le Directeur Général après votre première connexion.
            </p>
          </div>

          {/* Erreur */}
          {error && (
            <div className="p-3 mb-4 bg-red-900/30 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2 font-mono">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Bouton Google */}
          <button
            id="btn-google-login"
            onClick={onGoogleLogin}
            disabled={loading}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden ${
              loading
                ? 'bg-slate-800 border border-slate-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 active:scale-[0.98]'
            }`}
          >
            {/* Shimmer effect */}
            {hovered && !loading && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_0.6s_ease-in-out]" />
            )}

            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Authentification en cours...</span>
              </>
            ) : (
              <>
                {/* Google icon inline SVG */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#0A1128" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#0A1128" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#0A1128" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#0A1128" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Se connecter avec Google</span>
                <Sparkles className="w-4 h-4 shrink-0 opacity-70" />
              </>
            )}
          </button>

          {/* Note sécurité */}
          <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-gray-600 font-mono">
            <Shield className="w-3 h-3 text-gray-600" />
            <span>Connexion sécurisée via Firebase Authentication · Accès chiffré</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-[10px] text-gray-700 font-mono tracking-widest">
          Imperium-CDS-Edition © {new Date().getFullYear()} Capital du Savoir<br />
          Note d'Information N°0002 — Tous droits réservés
        </div>
      </div>
    </div>
  );
}
