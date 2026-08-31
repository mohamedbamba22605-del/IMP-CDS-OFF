// src/components/citadelle/ExecutiveDashboard.jsx
import React, { useState } from 'react';
import { Castle, Wallet, TrendingUp, TrendingDown, Shield, CheckCircle, AlertTriangle, Clock, FileText, Eye, Check, X } from '../ui/Icons';
import VetoButton from '../pegazus/VetoButton';
import { isCEO } from '../../config/roles';

export default function ExecutiveDashboard({ transactions = [], currentUser, onApprove, onVeto, onViewProof }) {
  const approvedTx = transactions.filter(t => t.status === 'approved');
  const pendingTx = transactions.filter(t => t.status === 'pending_approval');
  const vetoedTx = transactions.filter(t => t.status === 'vetoed');

  const totalIncomes = approvedTx
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpenses = approvedTx
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const currentBalance = totalIncomes - totalExpenses;
  const complianceRate = transactions.length > 0 
    ? Math.round(((transactions.length - vetoedTx.length) / transactions.length) * 100)
    : 100;

  const formatMoney = (val) => {
    return new Intl.NumberFormat('fr-FR').format(val) + " FCFA";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER TABLEAU DE BORD EXÉCUTIF */}
      <div className="p-6 bg-gradient-to-r from-[#0A1128] via-[#0B192C] to-[#001F54] border border-gold/30 rounded-3xl shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 p-8 text-gold/5 pointer-events-none">
          <Castle className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-full text-xs font-mono uppercase font-bold tracking-wider">
              Espace Direction & Exécutif
            </span>
            <span className="text-xs font-mono text-gray-400">Capital du Savoir</span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-wider font-serif text-white">
            Tableau de Bord Citadelle
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl leading-relaxed">
            Vue consolidée de la santé financière, de l'état de la trésorerie et de la validation des engagements de l'institution.
          </p>
        </div>
      </div>

      {/* KPI METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SOLDE GLOBAL */}
        <div className="p-5 bg-[#0B192C]/80 border border-gold/40 rounded-2xl backdrop-blur-md shadow-xl text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Solde Trésorerie</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-amber-300 font-mono tracking-tight">
            {formatMoney(currentBalance)}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1 font-mono">
            <Shield className="w-3 h-3 text-emerald-400" /> Solde net consolidé approuvé
          </p>
        </div>

        {/* RECETTES CUMULÉES */}
        <div className="p-5 bg-[#0B192C]/80 border border-emerald-500/30 rounded-2xl backdrop-blur-md shadow-xl text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Recettes Totales</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-emerald-400 font-mono tracking-tight">
            +{formatMoney(totalIncomes)}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 font-mono">
            {approvedTx.filter(t => t.type === 'income').length} entrées validées
          </p>
        </div>

        {/* DÉPENSES CUMULÉES */}
        <div className="p-5 bg-[#0B192C]/80 border border-red-500/30 rounded-2xl backdrop-blur-md shadow-xl text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Dépenses Approuvées</span>
            <div className="p-2 bg-red-500/10 text-red-400 rounded-xl border border-red-500/30">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-red-400 font-mono tracking-tight">
            -{formatMoney(totalExpenses)}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 font-mono">
            {approvedTx.filter(t => t.type === 'expense').length} sorties validées
          </p>
        </div>

        {/* CONFORMITÉ & ATTENTE */}
        <div className="p-5 bg-[#0B192C]/80 border border-cyan-500/30 rounded-2xl backdrop-blur-md shadow-xl text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Conformité / Attente</span>
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/30">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-cyan-300 font-mono">{complianceRate}%</span>
            <span className="text-xs font-bold text-yellow-400 font-mono">{pendingTx.length} en attente</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 font-mono">
            Taux de conformité & contrôles
          </p>
        </div>
      </div>

      {/* FILE DE VALIDATION DES TRANSACTIONS EN ATTENTE */}
      <div className="p-6 bg-[#0B192C]/80 border border-slate-800 rounded-2xl backdrop-blur-md shadow-xl text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Demandes d'Engagement en Attente de Validation Exécutive
            </h3>
          </div>
          <span className="px-3 py-0.5 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 rounded-full text-xs font-mono font-bold">
            {pendingTx.length} en attente
          </span>
        </div>

        {pendingTx.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-gray-400 text-xs">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
            Aucune transaction financière en attente de validation.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTx.map((tx) => (
              <div 
                key={tx.id} 
                className="p-4 bg-slate-900/70 border border-slate-800 hover:border-amber-500/30 rounded-xl transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${tx.type === 'income' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                      {tx.type === 'income' ? 'Recette' : 'Dépense'}
                    </span>
                    <span className="text-xs font-mono text-gray-400">{tx.category}</span>
                    <span className="text-xs font-mono text-gray-500">• {new Date(tx.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{tx.description}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
                    <span>Saisi par : <strong className="text-gray-300">{tx.createdByName}</strong></span>
                    {tx.proofFileName && (
                      <button 
                        onClick={() => onViewProof(tx)}
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Justificatif : {tx.proofFileName}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                  <span className={`text-base font-extrabold font-mono ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount)}
                  </span>

                  <div className="flex items-center gap-2">
                    {onViewProof && (
                      <button
                        onClick={() => onViewProof(tx)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-gray-300 font-bold text-xs rounded-xl flex items-center gap-1 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" /> Voir Preuve
                      </button>
                    )}

                    <button
                      onClick={() => onApprove(tx.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" /> Valider
                    </button>

                    <VetoButton
                      userRole={currentUser?.role}
                      targetId={tx.id}
                      targetType={`la transaction de ${formatMoney(tx.amount)}`}
                      onVetoExecuted={(targetId, reason) => onVeto(targetId, reason)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
