// src/components/arsenal/ArsenalManager.jsx
import React, { useState, useEffect } from 'react';
import MiniCRM from './MiniCRM';
import TDRManager from './TDRManager';
import { Briefcase, FileText } from '../ui/Icons';
import { getCrmContacts, addCrmContact, getTdrProjects, createTdrProject, approveTdrProject, vetoTdrProject } from '../../services/crmService';

export default function ArsenalManager({ currentUser }) {
  const [activeSubTab, setActiveSubTab] = useState('crm');
  const [contacts, setContacts] = useState([]);
  const [tdrProjects, setTdrProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cData, tData] = await Promise.all([
        getCrmContacts(),
        getTdrProjects()
      ]);
      setContacts(cData);
      setTdrProjects(tData);
    } catch (e) {
      console.warn("Erreur chargement Arsenal:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (contactData) => {
    const newC = await addCrmContact(contactData, currentUser);
    setContacts(prev => [newC, ...prev]);
  };

  const handleCreateTdr = async (tdrData) => {
    const newT = await createTdrProject(tdrData, currentUser);
    setTdrProjects(prev => [newT, ...prev]);
  };

  const handleApproveTdr = async (tdrId) => {
    await approveTdrProject(tdrId, currentUser?.uid);
    setTdrProjects(prev => prev.map(t => t.id === tdrId ? { ...t, status: 'approved' } : t));
  };

  const handleVetoTdr = async (tdrId, reason) => {
    await vetoTdrProject(tdrId, currentUser?.uid, reason);
    setTdrProjects(prev => prev.map(t => t.id === tdrId ? { ...t, status: 'vetoed', vetoReason: reason } : t));
  };

  return (
    <div className="space-y-5 sm:space-y-6 pb-12 animate-in fade-in duration-300">
      {/* ARSENAL NAVIGATION SECONDAIRE SCROLLABLE */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-800 pb-2.5 sm:pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('crm')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
            activeSubTab === 'crm'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg'
              : 'text-gray-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Mini-CRM Partenaires</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tdr')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
            activeSubTab === 'tdr'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-lg'
              : 'text-gray-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Termes de Référence (TDR)</span>
        </button>
      </div>

      {/* SOUS-CONTENU ARSENAL */}
      {activeSubTab === 'crm' && (
        <MiniCRM
          contacts={contacts}
          currentUser={currentUser}
          onAddContact={handleAddContact}
        />
      )}

      {activeSubTab === 'tdr' && (
        <TDRManager
          tdrProjects={tdrProjects}
          currentUser={currentUser}
          onCreateTdr={handleCreateTdr}
          onApproveTdr={handleApproveTdr}
          onVetoTdr={handleVetoTdr}
        />
      )}
    </div>
  );
}
