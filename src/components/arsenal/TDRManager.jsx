// src/components/arsenal/TDRManager.jsx
import React, { useState } from 'react';
import { FileText, Plus, CheckCircle, AlertTriangle, Eye, Shield, X, Trash2, CalendarClock, Wallet, Check } from '../ui/Icons';
import VetoButton from '../pegazus/VetoButton';
import { isCEO } from '../../config/roles';

export default function TDRManager({ tdrProjects = [], currentUser, onCreateTdr, onApproveTdr, onVetoTdr }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [objectives, setObjectives] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [deliverables, setDeliverables] = useState(['']);

  const [selectedTdr, setSelectedTdr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDeliverableChange = (index, value) => {
    const updated = [...deliverables];
    updated[index] = value;
    setDeliverables(updated);
  };

  const handleAddDeliverable = () => {
    setDeliverables([...deliverables, '']);
  };

  const handleRemoveDeliverable = (index) => {
    if (deliverables.length === 1) return;
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !context.trim() || !objectives.trim()) {
      setErrorMsg("Le titre, le contexte et les objectifs du TDR sont obligatoires.");
      return;
    }

    const cleanDeliverables = deliverables.filter(d => d.trim() !== '');

    setLoading(true);
    try {
      await onCreateTdr({
        title,
        context,
        objectives,
        targetAudience,
        budget: parseFloat(budget || 0),
        timeline,
        deliverables: cleanDeliverables
      });

      setTitle('');
      setContext('');
      setObjectives('');
      setTargetAudience('');
      setBudget('');
      setTimeline('');
      setDeliverables(['']);
      setShowCreateModal(false);
    } catch (e) {
      setErrorMsg(e.message || "Erreur lors de la création du TDR.");
    } finally {
      setLoading(false);
    }
  };

  const safeTdrList = Array.isArray(tdrProjects) ? tdrProjects : [];
  const formatMoney = (val) => new Intl.NumberFormat('fr-FR').format(val || 0) + " FCFA";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER DE GESTION DES TDR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[#0B192C]/90 border border-slate-800 rounded-2xl backdrop-blur-md text-white shadow-xl">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-indigo-400 font-serif flex items-center gap-2">
            <FileText className="w-6 h-6" /> Gestionnaire de Termes de Référence (TDR)
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Cadrage méthodologique, budgétaire et planification des projets institutionnels.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Rédiger un Nouveau TDR</span>
        </button>
      </div>

      {/* LISTE DES PROJETS TDR */}
      <div className="p-6 bg-[#0B192C]/80 border border-slate-800 rounded-2xl backdrop-blur-md shadow-xl text-white">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
          Projets & TDR de l'Institution ({safeTdrList.length})
        </h3>

        {safeTdrList.length === 0 ? (
          <p className="text-xs text-gray-500 italic text-center py-8">Aucun Terme de Référence rédigé pour le moment.</p>
        ) : (
          <div className="space-y-4">
            {safeTdrList.map((tdr) => (
              <div 
                key={tdr.id}
                className="p-5 bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 rounded-2xl transition-all space-y-3 font-sans text-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 font-mono">
                    {tdr.status === 'approved' && (
                      <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold">
                        TDR Validé
                      </span>
                    )}
                    {tdr.status === 'pending_approval' && (
                      <span className="px-2.5 py-0.5 bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 rounded text-[10px] font-bold">
                        En Attente de Validation
                      </span>
                    )}
                    {tdr.status === 'vetoed' && (
                      <span className="px-2.5 py-0.5 bg-red-600/30 text-red-300 border border-red-500/50 rounded text-[10px] font-bold" title={tdr.vetoReason}>
                        VETO CEO
                      </span>
                    )}

                    <span className="text-[10px] text-gray-400">Budget: <strong className="text-amber-300">{formatMoney(tdr.budget)}</strong></span>
                  </div>

                  <h4 className="font-extrabold text-white text-base">{tdr.title}</h4>
                  <p className="text-gray-300 text-xs line-clamp-2 leading-relaxed">{tdr.context}</p>

                  <div className="text-[10px] font-mono text-gray-400">
                    Rédigé par : <strong className="text-gray-300">{tdr.createdByName}</strong> le {new Date(tdr.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedTdr(tdr)}
                      className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Voir Document
                    </button>

                    {tdr.status === 'pending_approval' && (
                      <>
                        <button
                          onClick={() => onApproveTdr(tdr.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1"
                        >
                          <Check className="w-4 h-4" /> Valider
                        </button>

                        <VetoButton
                          userRole={currentUser?.role}
                          targetId={tdr.id}
                          targetType={`le projet TDR "${tdr.title}"`}
                          onVetoExecuted={(targetId, reason) => onVetoTdr(targetId, reason)}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALE RÉDACTION TDR */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[250] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0B192C] border border-indigo-500/40 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider font-serif">
                  Rédaction d'un Terme de Référence (TDR)
                </h3>
                <p className="text-xs text-gray-400">Cadrage de projet pour Capital du Savoir.</p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 bg-red-900/30 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2 font-mono">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-gray-400 uppercase mb-1">Intitulé du Projet / TDR *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: TDR - Déploiement de la Plateforme d'Apprentissage Hybride 2026"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-400 font-sans text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase mb-1">Contexte & Justification du Projet *</label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Expliquez la problématique, les besoins institutionnels et le contexte global..."
                  rows={3}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-400 font-sans text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase mb-1">Objectifs Stratégiques & Pédagogiques *</label>
                <textarea
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  placeholder="Objectifs généraux et spécifiques attendus..."
                  rows={3}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-400 font-sans text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 uppercase mb-1">Public Cible</label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Ex: Étudiants, Enseignants"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-400 font-sans text-xs"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 uppercase mb-1">Budget Estimé (FCFA)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="Ex: 5000000"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-400 font-extrabold"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 uppercase mb-1">Calendrier d'Exécution</label>
                  <input
                    type="text"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    placeholder="Ex: 01 Oct - 30 Nov 2026"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-400 font-sans text-xs"
                  />
                </div>
              </div>

              {/* LIVRABLES ATTENDUS */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-indigo-400 uppercase font-bold">Livrables Attendus du Projet</label>
                  <button
                    type="button"
                    onClick={handleAddDeliverable}
                    className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded text-[10px] font-bold"
                  >
                    + Ajouter Livrable
                  </button>
                </div>

                <div className="space-y-2">
                  {deliverables.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-indigo-500 font-bold">{idx + 1}.</span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleDeliverableChange(idx, e.target.value)}
                        placeholder="Ex: Rapport de recette fonctionnelle..."
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-400 font-sans text-xs"
                      />
                      {deliverables.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDeliverable(idx)}
                          className="p-2 text-gray-500 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold uppercase rounded-xl transition-all shadow-lg shadow-indigo-500/20"
              >
                {loading ? "Création en cours..." : "Soumettre le TDR à la Direction"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODALE AFFICHAGE DOCUMENT COMPLET TDR */}
      {selectedTdr && (
        <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0B192C] border border-indigo-500/40 w-full max-w-3xl rounded-2xl p-6 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto space-y-4 font-sans">
            <button
              onClick={() => setSelectedTdr(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="border-b border-slate-800 pb-4">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full text-xs font-mono font-bold uppercase mb-2 inline-block">
                Document Institutionnel de Projets CDS
              </span>
              <h2 className="text-xl font-extrabold text-white font-serif">{selectedTdr.title}</h2>
              <p className="text-xs text-gray-400 font-mono mt-1">
                Rédigé par {selectedTdr.createdByName} le {new Date(selectedTdr.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-indigo-400 uppercase tracking-wider font-mono mb-1">1. Contexte & Justification :</h4>
                <p className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-gray-300 leading-relaxed">
                  {selectedTdr.context}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-indigo-400 uppercase tracking-wider font-mono mb-1">2. Objectifs Stratégiques :</h4>
                <p className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-gray-300 leading-relaxed">
                  {selectedTdr.objectives}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span className="text-gray-400 text-[10px] block uppercase">Public Cible :</span>
                  <span className="text-white font-bold">{selectedTdr.targetAudience || 'Non spécifié'}</span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span className="text-gray-400 text-[10px] block uppercase">Budget Estimé :</span>
                  <span className="text-amber-300 font-bold">{formatMoney(selectedTdr.budget)}</span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span className="text-gray-400 text-[10px] block uppercase">Calendrier :</span>
                  <span className="text-cyan-300 font-bold">{selectedTdr.timeline || 'Non spécifié'}</span>
                </div>
              </div>

              {selectedTdr.deliverables?.length > 0 && (
                <div>
                  <h4 className="font-bold text-indigo-400 uppercase tracking-wider font-mono mb-1">3. Livrables de Projet Attendu :</h4>
                  <ul className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl space-y-1 text-gray-200">
                    {selectedTdr.deliverables.map((d, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
