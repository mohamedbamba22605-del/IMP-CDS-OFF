// src/components/radioQG/ReportingComplianceTracker.jsx
import React, { useState } from 'react';
import { Radio, CalendarClock, CheckCircle, AlertTriangle, Plus, Search, FileText, Eye, UserCircle, X } from '../ui/Icons';

export default function ReportingComplianceTracker({ reports = [], currentUser, onOpenNewReport }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  const safeReports = Array.isArray(reports) ? reports : [];

  const filteredReports = safeReports.filter(r => {
    if (!r) return false;
    const search = searchTerm.toLowerCase();
    const author = r.authorName ? String(r.authorName).toLowerCase() : '';
    const dept = r.department ? String(r.department).toLowerCase() : '';
    const summary = r.summary ? String(r.summary).toLowerCase() : '';
    return author.includes(search) || dept.includes(search) || summary.includes(search);
  });

  // Calcul du délai depuis le dernier rapport
  const latestReport = safeReports[0];
  let daysSinceLastReport = 0;
  if (latestReport && latestReport.submittedAt) {
    const diffTime = Math.abs(new Date() - new Date(latestReport.submittedAt));
    daysSinceLastReport = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  const isCompliant = daysSinceLastReport <= 3;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* BANNIÈRE CONFORMITÉ TRIENNALE */}
      <div className="p-6 bg-gradient-to-r from-[#0A1128] via-[#0B192C] to-[#102A43] border border-cyan-500/30 rounded-3xl shadow-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-0.5 rounded-full text-xs font-mono font-bold border ${isCompliant ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'}`}>
              {isCompliant ? 'CONFORME (Cadence 3 jours)' : 'ALERTE DE RETARD REPORTING'}
            </span>
            <span className="text-xs font-mono text-gray-400">Capital du Savoir</span>
          </div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-white font-serif">
            Suivi des Reports Triennaux
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Dernière soumission enregistrée il y a <strong className="text-cyan-300">{daysSinceLastReport} jour(s)</strong>.
          </p>
        </div>

        <button
          onClick={onOpenNewReport}
          className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Soumettre Rapport Triennal</span>
        </button>
      </div>

      {/* RECHERCHE ET HISTORIQUE */}
      <div className="p-6 bg-[#0B192C]/80 border border-slate-800 rounded-2xl backdrop-blur-md shadow-xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" /> Flux des Rapports Soumis ({filteredReports.length})
          </h3>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrer par auteur, département..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <p className="text-xs text-gray-500 italic text-center py-8">Aucun rapport triennal trouvé.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReports.map((rep) => (
              <div 
                key={rep.id} 
                className="p-5 bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 rounded-2xl transition-all space-y-3 font-sans text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 font-mono">
                    <span className="px-2 py-0.5 bg-slate-800 text-cyan-300 rounded text-[10px] font-bold">
                      {rep.department || 'Département'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Du {rep.periodStart} au {rep.periodEnd}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-sm mb-1 line-clamp-2">{rep.summary}</h4>
                  
                  <div className="text-gray-400 text-[11px] font-mono mb-2">
                    Auteur : <strong className="text-gray-300">{rep.authorName}</strong> ({rep.authorRole})
                  </div>

                  {rep.achievements?.length > 0 && (
                    <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Principale Réalisation :</span>
                      <p className="text-[11px] text-gray-300 truncate">• {rep.achievements[0]}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] font-mono text-gray-500">
                    Soumis le {new Date(rep.submittedAt).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => setSelectedReport(rep)}
                    className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Consulter Détails
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALE DÉTAILS D'UN RAPPORT */}
      {selectedReport && (
        <div className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0B192C] border border-cyan-500/40 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative text-white max-h-[85vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider font-serif">
                  Rapport Triennal Institutionnel
                </h3>
                <p className="text-xs text-gray-400 font-mono">
                  {selectedReport.department} • Soumis par {selectedReport.authorName}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Période du Rapport :</span>
                <span className="text-cyan-300 font-bold">{selectedReport.periodStart} au {selectedReport.periodEnd}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Horodatage Soumission :</span>
                <span className="text-white">{new Date(selectedReport.submittedAt).toLocaleString()}</span>
              </div>
            </div>

            {/* SYNTHÈSE */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1 font-mono">Synthèse Globale :</h4>
              <p className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-gray-200 leading-relaxed">
                {selectedReport.summary}
              </p>
            </div>

            {/* RÉALISATIONS */}
            {selectedReport.achievements?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1 font-mono">Réalisations & Avancées :</h4>
                <ul className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-1 text-xs text-emerald-200">
                  {selectedReport.achievements.map((a, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* POINTS DE BLOCAGE */}
            {selectedReport.blockers?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1 font-mono">Freins & Difficultés :</h4>
                <ul className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl space-y-1 text-xs text-amber-200">
                  {selectedReport.blockers.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* PROCHAINES ACTIONS */}
            {selectedReport.nextActions?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1 font-mono">Prochaines Perspectives (3 Jours) :</h4>
                <ul className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl space-y-1 text-xs text-cyan-200">
                  {selectedReport.nextActions.map((n, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{n}</span>
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
