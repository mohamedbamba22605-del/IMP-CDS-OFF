// src/components/radioQG/TriennialReportForm.jsx
import React, { useState } from 'react';
import { FileText, Plus, Trash2, CheckCircle, AlertTriangle, Send, CalendarClock } from '../ui/Icons';

export default function TriennialReportForm({ currentUser, onSubmitReport, onCancel }) {
  const today = new Date().toISOString().split('T')[0];
  const threeDaysAgo = new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0];

  const [periodStart, setPeriodStart] = useState(threeDaysAgo);
  const [periodEnd, setPeriodEnd] = useState(today);
  const [department, setDepartment] = useState(currentUser?.department || 'Secrétariat Général');
  const [summary, setSummary] = useState('');
  
  const [achievements, setAchievements] = useState(['']);
  const [blockers, setBlockers] = useState(['']);
  const [nextActions, setNextActions] = useState(['']);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Gestion des listes dynamiques (Réalisations, Blocages, Actions)
  const handleItemChange = (setter, list, index, value) => {
    const updated = [...list];
    updated[index] = value;
    setter(updated);
  };

  const handleAddItem = (setter, list) => {
    setter([...list, '']);
  };

  const handleRemoveItem = (setter, list, index) => {
    if (list.length === 1) return;
    setter(list.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!summary.trim()) {
      setErrorMsg("Le résumé global de l'activité triennale est obligatoire.");
      return;
    }

    const cleanAchievements = achievements.filter(a => a.trim() !== '');
    const cleanBlockers = blockers.filter(b => b.trim() !== '');
    const cleanNextActions = nextActions.filter(n => n.trim() !== '');

    if (cleanAchievements.length === 0) {
      setErrorMsg("Veuillez indiquer au moins une réalisation majeure accomplie durant ces 3 jours.");
      return;
    }

    setLoading(true);
    try {
      await onSubmitReport({
        periodStart,
        periodEnd,
        department,
        summary,
        achievements: cleanAchievements,
        blockers: cleanBlockers,
        nextActions: cleanNextActions
      });
      if (onCancel) onCancel();
    } catch (e) {
      setErrorMsg(e.message || "Erreur lors de la soumission du rapport triennal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#0B192C] border border-cyan-500/40 rounded-3xl shadow-2xl text-white max-w-3xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider text-white font-serif">
              Formulaire de Reporting Triennal Obligatoire
            </h2>
            <p className="text-xs text-gray-400">
              Cadence institutionnelle : soumission requise tous les trois (3) jours.
            </p>
          </div>
        </div>

        <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-xs font-mono font-bold">
          Code CDS-REP-03
        </span>
      </div>

      {errorMsg && (
        <div className="p-3 mb-6 bg-red-900/30 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2 font-mono">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 font-mono text-xs">
        {/* PÉRIODE ET DÉPARTEMENT */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-400 uppercase mb-1">Début de Période</label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-gray-400 uppercase mb-1">Fin de Période</label>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-gray-400 uppercase mb-1">Département / Direction</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400 font-sans"
            />
          </div>
        </div>

        {/* RÉSUMÉ GLOBAL */}
        <div>
          <label className="block text-gray-400 uppercase mb-1">Résumé Synthétique du Bilan (Obligatoire) *</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Synthèse des activités menées, réunions tenues et décisions prises au cours des 3 derniers jours..."
            rows={3}
            required
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400 font-sans text-xs"
          />
        </div>

        {/* RÉALISATIONS MAJEURES (LISTE DYNAMIQUE) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-emerald-400 uppercase font-bold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Réalisations & Objectifs Atteints *
            </label>
            <button
              type="button"
              onClick={() => handleAddItem(setAchievements, achievements)}
              className="px-2.5 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold hover:bg-emerald-500/20"
            >
              + Ajouter une Réalisation
            </button>
          </div>

          <div className="space-y-2">
            {achievements.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">{idx + 1}.</span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleItemChange(setAchievements, achievements, idx, e.target.value)}
                  placeholder="Exemple : Finalisation du règlement intérieur révisé..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-400 font-sans"
                />
                {achievements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(setAchievements, achievements, idx)}
                    className="p-2 text-gray-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FREINS ET BLOCAGES (LISTE DYNAMIQUE) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-amber-400 uppercase font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Difficultés & Points de Blocage
            </label>
            <button
              type="button"
              onClick={() => handleAddItem(setBlockers, blockers)}
              className="px-2.5 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold hover:bg-amber-500/20"
            >
              + Ajouter une Difficulté
            </button>
          </div>

          <div className="space-y-2">
            {blockers.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-amber-500 font-bold">{idx + 1}.</span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleItemChange(setBlockers, blockers, idx, e.target.value)}
                  placeholder="Exemple : Retard de validation administrative externe..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400 font-sans"
                />
                {blockers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(setBlockers, blockers, idx)}
                    className="p-2 text-gray-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* PROCHAINES ACTIONS (LISTE DYNAMIQUE) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-cyan-400 uppercase font-bold flex items-center gap-1.5">
              <Send className="w-4 h-4" /> Actions Prioritaires pour les 3 Prochains Jours
            </label>
            <button
              type="button"
              onClick={() => handleAddItem(setNextActions, nextActions)}
              className="px-2.5 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded-lg text-[10px] font-bold hover:bg-cyan-500/20"
            >
              + Ajouter une Action
            </button>
          </div>

          <div className="space-y-2">
            {nextActions.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-cyan-500 font-bold">{idx + 1}.</span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleItemChange(setNextActions, nextActions, idx, e.target.value)}
                  placeholder="Exemple : Organisation du séminaire d'accueil..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400 font-sans"
                />
                {nextActions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(setNextActions, nextActions, idx)}
                    className="p-2 text-gray-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* BOUTONS ACTIONS */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold uppercase rounded-xl transition-all"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold uppercase rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? "Transmissions en cours..." : "Soumettre au Secrétariat Général"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
