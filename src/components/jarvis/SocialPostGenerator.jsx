// src/components/jarvis/SocialPostGenerator.jsx
import React, { useState } from 'react';
import { Cpu, Sparkles, Copy, CheckCircle, AlertTriangle, Send, Loader2, Globe } from '../ui/Icons';
import { generateSocialPostWithAi } from '../../services/jarvisService';

export default function SocialPostGenerator({ currentUser, onQuotaUpdate }) {
  const [platform, setPlatform] = useState('linkedin');
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('Étudiants, professionnels et partenaires CDS');
  const [loading, setLoading] = useState(false);
  const [generatedPost, setGeneratedPost] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!topic.trim()) {
      setErrorMsg("Veuillez entrer le sujet ou le message clé de votre publication.");
      return;
    }

    setLoading(true);
    try {
      const text = await generateSocialPostWithAi(platform, topic, audience, currentUser?.uid);
      setGeneratedPost(text);
      if (onQuotaUpdate) onQuotaUpdate();
    } catch (e) {
      setErrorMsg(e.message || "Erreur lors de la rédaction du post par l'IA.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedPost) return;
    navigator.clipboard.writeText(generatedPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="p-6 bg-[#0B192C] border border-purple-500/30 rounded-3xl shadow-2xl text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-purple-400">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider text-white font-serif">
              Générateur IA de Posts Réseaux Sociaux
            </h3>
            <p className="text-xs text-gray-400">
              Rédigez des publications optimisées pour LinkedIn, Facebook et Twitter pour Capital du Savoir.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 bg-red-900/30 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2 font-mono">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleGenerate} className="space-y-4 font-mono text-xs">
          {/* PLATEFORME */}
          <div>
            <label className="block text-gray-400 uppercase mb-1">Réseau Social Cible *</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPlatform('linkedin')}
                className={`py-2.5 rounded-xl font-bold uppercase transition-all border ${
                  platform === 'linkedin'
                    ? 'bg-blue-600/30 border-blue-500 text-blue-300 shadow-lg'
                    : 'bg-slate-900 border-slate-800 text-gray-400'
                }`}
              >
                LinkedIn
              </button>

              <button
                type="button"
                onClick={() => setPlatform('facebook')}
                className={`py-2.5 rounded-xl font-bold uppercase transition-all border ${
                  platform === 'facebook'
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 shadow-lg'
                    : 'bg-slate-900 border-slate-800 text-gray-400'
                }`}
              >
                Facebook
              </button>

              <button
                type="button"
                onClick={() => setPlatform('twitter')}
                className={`py-2.5 rounded-xl font-bold uppercase transition-all border ${
                  platform === 'twitter'
                    ? 'bg-cyan-600/30 border-cyan-500 text-cyan-300 shadow-lg'
                    : 'bg-slate-900 border-slate-800 text-gray-400'
                }`}
              >
                Twitter (X)
              </button>
            </div>
          </div>

          {/* SUJET DU POST */}
          <div>
            <label className="block text-gray-400 uppercase mb-1">Sujet ou Annonce de la Publication *</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: Ouverture des candidatures pour la bourse d'excellence CDS 2026-2027"
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-purple-400 font-sans text-xs font-bold"
            />
          </div>

          {/* PUBLIC CIBLE */}
          <div>
            <label className="block text-gray-400 uppercase mb-1">Public Cible Spécifique</label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Ex: Nouveaux bacheliers, chercheurs, partenaires"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400 font-sans text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold uppercase rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? "Rédaction par Jarvis IA en cours..." : "Rédiger le Post par l'IA (Consomme 1 Quota)"}</span>
          </button>
        </form>
      </div>

      {/* RÉSULTAT DU POST */}
      {generatedPost && (
        <div className="p-6 bg-[#0B192C]/90 border border-purple-500/40 rounded-3xl backdrop-blur-md shadow-2xl text-white space-y-4 font-sans animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
            <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full text-[10px] font-bold uppercase">
              Post Réseau Social ({platform.toUpperCase()})
            </span>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-gray-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copié !" : "Copier le texte"}</span>
            </button>
          </div>

          <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 text-xs text-gray-200 whitespace-pre-wrap leading-relaxed">
            {generatedPost}
          </div>
        </div>
      )}
    </div>
  );
}
