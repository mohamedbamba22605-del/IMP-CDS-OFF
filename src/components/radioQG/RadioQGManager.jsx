// src/components/radioQG/RadioQGManager.jsx
import React, { useState, useEffect } from 'react';
import ReportingComplianceTracker from './ReportingComplianceTracker';
import TriennialReportForm from './TriennialReportForm';
import SecureArchiveModule from './SecureArchiveModule';
import { Radio, Lock, CalendarClock } from '../ui/Icons';
import { getTriennialReports, submitTriennialReport, getArchiveDocuments, addArchiveDocument } from '../../services/reportingService';

export default function RadioQGManager({ currentUser }) {
  const [activeSubTab, setActiveSubTab] = useState('reporting');
  const [showReportForm, setShowReportForm] = useState(false);

  const [reports, setReports] = useState([]);
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [repsData, archsData] = await Promise.all([
        getTriennialReports(),
        getArchiveDocuments()
      ]);
      setReports(repsData);
      setArchives(archsData);
    } catch (e) {
      console.warn("Erreur chargement Radio QG:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async (reportData) => {
    const newRep = await submitTriennialReport(reportData, currentUser);
    setReports(prev => [newRep, ...prev]);
    setShowReportForm(false);
  };

  const handleAddArchive = async (archiveData) => {
    const newArch = await addArchiveDocument(archiveData);
    setArchives(prev => [newArch, ...prev]);
  };

  return (
    <div className="space-y-5 sm:space-y-6 pb-12 animate-in fade-in duration-300">
      {/* RADIO QG NAVIGATION SECONDAIRE SCROLLABLE */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-800 pb-2.5 sm:pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => { setActiveSubTab('reporting'); setShowReportForm(false); }}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
            activeSubTab === 'reporting'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg'
              : 'text-gray-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Reporting Triennal (3 Jours)</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('archives'); setShowReportForm(false); }}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
            activeSubTab === 'archives'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg'
              : 'text-gray-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Archives Sécurisées (PV & Notes)</span>
        </button>
      </div>

      {/* VUE FORMULAIRE DE REPORTING */}
      {showReportForm ? (
        <TriennialReportForm
          currentUser={currentUser}
          onSubmitReport={handleSubmitReport}
          onCancel={() => setShowReportForm(false)}
        />
      ) : (
        <>
          {activeSubTab === 'reporting' && (
            <ReportingComplianceTracker
              reports={reports}
              currentUser={currentUser}
              onOpenNewReport={() => setShowReportForm(true)}
            />
          )}

          {activeSubTab === 'archives' && (
            <SecureArchiveModule
              archives={archives}
              currentUser={currentUser}
              onAddArchive={handleAddArchive}
            />
          )}
        </>
      )}
    </div>
  );
}
