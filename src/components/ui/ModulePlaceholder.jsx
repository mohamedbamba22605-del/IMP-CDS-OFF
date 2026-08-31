// src/components/ui/ModulePlaceholder.jsx
import React from 'react';
import { Lock, Clock, Sparkles, Shield } from './Icons';

export default function ModulePlaceholder({ title, description, phase, icon: Icon }) {
  return (
    <div className="p-8 bg-[#0B192C]/80 border border-gold/20 rounded-3xl backdrop-blur-xl text-center max-w-xl mx-auto my-12 shadow-2xl text-white animate-in fade-in duration-300">
      <div className="w-20 h-20 bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-gold/40 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-gold/10">
        {Icon ? <Icon className="w-10 h-10 text-amber-400" /> : <Lock className="w-10 h-10 text-cyan-400" />}
      </div>

      <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-full text-xs font-mono uppercase font-bold tracking-wider mb-3 inline-block">
        Déploiement Étape {phase}
      </span>

      <h2 className="text-2xl font-extrabold text-white uppercase tracking-wider font-serif mb-3">
        {title}
      </h2>

      <p className="text-gray-400 text-xs leading-relaxed mb-6">
        {description}
      </p>

      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-center gap-3 font-mono text-xs text-cyan-300">
        <Clock className="w-4 h-4 text-cyan-400 animate-spin" />
        <span>Ce module sera généré à l'étape suivante après validation de la Phase 1 (Pégazus).</span>
      </div>
    </div>
  );
}
