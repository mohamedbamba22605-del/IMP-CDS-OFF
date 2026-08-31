// src/components/jarvis/TDRGenerator.jsx
import React, { useState } from 'react';
import { Cpu, Sparkles, FileText, Copy, CheckCircle, AlertTriangle, Send, Loader2 } from '../ui/Icons';
import { generateTdrWithAi } from '../../services/jarvisService';

export default function TDRGenerator({ currentUser, onQuotaUpdate, onSendToArsenal }) {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedTdr, setGeneratedTdr] = useState(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!topic.trim()) {
      setErrorMsg("Veuillez entrer le sujet ou le titre du projet à cadrer en TDR.");
      return;
    }

    setLoading(true);
    try {
      const result = await generateTdrWithAi(topic, currentUser?.uid);
      setGeneratedTdr(result);
      if (onQuotaUpdate) onQuotaUpdate();
    } catch (e) {
      setErrorMsg(e.message || "Erreur lors de la génération du TDR par l'IA.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedTdr) return;
    const textToCopy = `=== ${generatedTdr.title} ===
CONTEXTE :
${generatedTdr.context}

OBJECTIFS :
${generatedTdr.objectives}

PUBLIC CIBLE : ${generatedTdr.targetAudience}
BUDGET ESTIMÉ : ${generatedTdr.budget} FCFA
CALENDRIER : ${generatedTdr.timeline}

LIVRABLES :
${generatedTdr.deliverables?.map(d => `- ${d}`).join('\n')}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="p-6 bg-[#0B192C] border border-cyan-500/30 rounded-3xl shadow-2xl text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider text-white font-serif">
              Générateur IA de Termes de Référence (TDR)
            </h3>
            <p className="text-xs text-gray-400">
              Rédigez instantanément un TDR institutionnel structuré pour Capital du Savoir.
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
          <div>
            <label className="block text-gray-400 uppercase mb-1">
              Sujet ou Objectif Global du Projet *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: Organisation de la Foire Scientifique et Numérique CDS 2026"
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-cyan-400 font-sans text-xs font-bold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-extrabold uppercase rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? "Génération par Jarvis IA en cours..." : "Générer le TDR par l'IA (Consomme 1 Quota)"}</span>
          </button>
        </form>
      </div>

      {/* RÉSULTAT GÉNÉRÉ */}
      {generatedTdr && (
        <div className="p-6 bg-[#0B192C]/90 border border-cyan-500/40 rounded-3xl backdrop-blur-md shadow-2xl text-white space-y-4 font-sans animate-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-[10px] font-mono font-bold uppercase">
                Génération IA Validée
              </span>
              <h4 className="text-lg font-extrabold text-white mt-1 font-serif">{generatedTdr.title}</h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-gray-200 border border-slate-700 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5"
              >
                {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copié !" : "Copier"}</span>
              </button>

              {onSendToArsenal && (
                <button
                  onClick={() => onSendToArsenal(generatedTdr)}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl font-mono shadow transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Envoyer dans Arsenal TDR</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold text-cyan-400 uppercase font-mono block mb-1">Contexte :</span>
              <p className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-gray-300 leading-relaxed">{generatedTdr.context}</p>
            </div>

            <div>
              <span className="font-bold text-cyan-400 uppercase font-mono block mb-1">Objectifs :</span>
              <p className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-gray-300 leading-relaxed">{generatedTdr.objectives}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="text-gray-400 text-[10px] uppercase block">Public Cible :</span>
                <span className="text-white font-bold">{generatedTdr.targetAudience}</span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="text-gray-400 text-[10px] uppercase block">Budget Suggéré :</span>
                <span className="text-amber-300 font-bold">{new Intl.NumberFormat('fr-FR').format(generatedTdr.budget)} FCFA</span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="text-gray-400 text-[10px] uppercase block">Calendrier :</span>
                <span className="text-cyan-300 font-bold">{generatedTdr.timeline}</span>
              </div>
            </div>

            {generatedTdr.deliverables?.length > 0 && (
              <div>
                <span className="font-bold text-cyan-400 uppercase font-mono block mb-1">Livrables Proposés :</span>
                <ul className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl space-y-1 text-cyan-200">
                  {generatedTdr.deliverables.map((d, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
