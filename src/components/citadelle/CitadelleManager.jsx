// src/components/citadelle/CitadelleManager.jsx
import React, { useState, useEffect } from 'react';
import ExecutiveDashboard from './ExecutiveDashboard';
import TreasuryModule from './TreasuryModule';
import { Castle, Wallet, FileText, X, Download } from '../ui/Icons';
import { getTreasuryTransactions, addTreasuryTransaction, approveTransaction, vetoTransaction } from '../../services/treasuryService';

export default function CitadelleManager({ currentUser }) {
  const [activeSubTab, setActiveSubTab] = useState('executive');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProofTx, setSelectedProofTx] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getTreasuryTransactions();
      setTransactions(data);
    } catch (e) {
      console.warn("Erreur chargement trésorerie:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (txData) => {
    const newTx = await addTreasuryTransaction(txData);
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleApprove = async (txId) => {
    await approveTransaction(txId, currentUser?.uid);
    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: 'approved' } : t));
  };

  const handleVeto = async (txId, reason) => {
    await vetoTransaction(txId, currentUser?.uid, reason);
    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: 'vetoed', vetoReason: reason } : t));
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* CITADELLE NAVIGATION SECONDAIRE */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('executive')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeSubTab === 'executive'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg'
              : 'text-gray-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Castle className="w-4 h-4" />
          <span>Tableau de Bord Exécutif</span>
        </button>

        <button
          onClick={() => setActiveSubTab('treasury')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeSubTab === 'treasury'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg'
              : 'text-gray-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Module Trésorerie & Justificatifs</span>
        </button>
      </div>

      {/* SOUS-CONTENU CITADELLE */}
      {activeSubTab === 'executive' && (
        <ExecutiveDashboard
          transactions={transactions}
          currentUser={currentUser}
          onApprove={handleApprove}
          onVeto={handleVeto}
          onViewProof={(tx) => setSelectedProofTx(tx)}
        />
      )}

      {activeSubTab === 'treasury' && (
        <TreasuryModule
          transactions={transactions}
          currentUser={currentUser}
          onAddTransaction={handleAddTransaction}
          onViewProof={(tx) => setSelectedProofTx(tx)}
          onVeto={handleVeto}
        />
      )}

      {/* MODALE DE VISUALISATION DU JUSTIFICATIF COMPTABLE */}
      {selectedProofTx && (
        <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0B192C] border border-cyan-500/40 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative text-white max-h-[90vh] flex flex-col">
            <button
              onClick={() => setSelectedProofTx(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider font-serif">
                  Justificatif Comptable CDS
                </h3>
                <p className="text-xs text-cyan-300 font-mono">
                  {selectedProofTx.proofFileName || 'Document_Justificatif.pdf'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 mb-4 text-xs font-mono">
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Description :</span>
                <span className="text-white font-bold">{selectedProofTx.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Montant :</span>
                <span className="text-amber-300 font-bold">{new Intl.NumberFormat('fr-FR').format(selectedProofTx.amount)} FCFA</span>
              </div>
            </div>

            {/* APERÇU DU DOCUMENT */}
            <div className="flex-1 min-h-[300px] bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden p-2">
              {selectedProofTx.proofUrl?.startsWith('data:image/') ? (
                <img 
                  src={selectedProofTx.proofUrl} 
                  alt="Justificatif" 
                  className="max-h-[400px] object-contain rounded-lg shadow"
                />
              ) : (
                <div className="text-center p-6 space-y-3">
                  <FileText className="w-16 h-16 text-cyan-400 mx-auto animate-pulse" />
                  <p className="text-xs text-gray-300 font-mono">Document PDF ou binaire scanné.</p>
                  <a
                    href={selectedProofTx.proofUrl}
                    download={selectedProofTx.proofFileName || "Justificatif_CDS.pdf"}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow transition-all"
                  >
                    <Download className="w-4 h-4" /> Télécharger le Document
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
