// src/components/citadelle/TreasuryModule.jsx
import React, { useState } from 'react';
import { Plus, Wallet, FileText, Upload, CheckCircle, AlertTriangle, Eye, Search, Filter, Shield, X, Download } from '../ui/Icons';
import VetoButton from '../pegazus/VetoButton';

export default function TreasuryModule({ transactions = [], currentUser, onAddTransaction, onViewProof, onVeto }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('equipement');
  const [description, setDescription] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("La taille du fichier justificatif ne doit pas dépasser 5 Mo.");
        return;
      }
      setProofFile(file);
      setProofPreview(file.name);
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!proofFile) {
      setErrorMsg("L'upload d'un justificatif (facture, reçu ou ordre de virement) est OBLIGATOIRE.");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setErrorMsg("Veuillez indiquer un montant supérieur à 0.");
      return;
    }

    setLoading(true);
    try {
      await onAddTransaction({
        type,
        amount: parseFloat(amount),
        category,
        description,
        proofFile,
        user: currentUser
      });

      // Réinitialisation
      setAmount('');
      setDescription('');
      setProofFile(null);
      setProofPreview(null);
      setShowAddModal(false);
    } catch (e) {
      setErrorMsg(e.message || "Erreur lors de la sauvegarde de la transaction.");
    } finally {
      setLoading(false);
    }
  };

  const safeTxList = Array.isArray(transactions) ? transactions : [];

  const filteredTransactions = safeTxList.filter(t => {
    if (!t) return false;
    const desc = t.description ? String(t.description).toLowerCase() : '';
    const creator = t.createdByName ? String(t.createdByName).toLowerCase() : '';
    const search = searchTerm.toLowerCase();

    const matchesSearch = desc.includes(search) || creator.includes(search);
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatMoney = (val) => new Intl.NumberFormat('fr-FR').format(val || 0) + " FCFA";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER DE GESTION DE TRÉSORERIE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[#0B192C]/90 border border-slate-800 rounded-2xl backdrop-blur-md text-white shadow-xl">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-amber-400 font-serif flex items-center gap-2">
            <Wallet className="w-6 h-6" /> Registre de Trésorerie Institutionnel
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Enregistrement rigoureux des recettes et dépenses avec dépôt obligatoire des preuves comptables.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nouvelle Opération (Avec Justificatif)</span>
        </button>
      </div>

      {/* RECHERCHE ET FILTRES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#0B192C]/60 border border-slate-800 rounded-2xl text-white">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par description ou auteur..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="all">Toutes les Catégories</option>
            <option value="frais_scolarite">Frais de Scolarité</option>
            <option value="subvention">Subvention / Don</option>
            <option value="partenariat">Partenariat</option>
            <option value="equipement">Équipement & Matériel</option>
            <option value="logistique">Logistique & Événementiel</option>
            <option value="salaire">Salaires & Honoraires</option>
            <option value="autre">Autre</option>
          </select>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="all">Tous les Statuts</option>
            <option value="approved">Approuvé</option>
            <option value="pending_approval">En Attente de Validation</option>
            <option value="vetoed">Veto CEO Appliqué</option>
          </select>
        </div>
      </div>

      {/* TABLEAU DES TRANSACTIONS */}
      <div className="p-6 bg-[#0B192C]/80 border border-slate-800 rounded-2xl backdrop-blur-md shadow-xl text-white overflow-hidden">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
          Historique des Mouvements Financiers ({filteredTransactions.length})
        </h3>

        {filteredTransactions.length === 0 ? (
          <p className="text-xs text-gray-500 italic text-center py-8">Aucune transaction correspondant aux critères.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-gray-400 uppercase text-[10px] tracking-wider font-mono">
                <tr>
                  <th className="p-3">Type</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Catégorie</th>
                  <th className="p-3">Montant</th>
                  <th className="p-3">Justificatif</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/40 transition-all font-mono">
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${tx.type === 'income' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                        {tx.type === 'income' ? 'Recette' : 'Dépense'}
                      </span>
                    </td>
                    <td className="p-3 font-sans">
                      <div className="font-bold text-white">{tx.description}</div>
                      <div className="text-[10px] text-gray-400">Saisi par : {tx.createdByName} le {new Date(tx.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-3 text-gray-300">{tx.category}</td>
                    <td className={`p-3 font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount)}
                    </td>
                    <td className="p-3">
                      {tx.proofFileName ? (
                        <button
                          onClick={() => onViewProof(tx)}
                          className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded text-[11px] flex items-center gap-1.5 transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[100px]">{tx.proofFileName}</span>
                        </button>
                      ) : (
                        <span className="text-red-400 text-[10px]">Absente</span>
                      )}
                    </td>
                    <td className="p-3">
                      {tx.status === 'approved' && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold">
                          Approuvé
                        </span>
                      )}
                      {tx.status === 'pending_approval' && (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 rounded text-[10px] font-bold">
                          En Attente
                        </span>
                      )}
                      {tx.status === 'vetoed' && (
                        <span className="px-2 py-0.5 bg-red-600/30 text-red-300 border border-red-500/50 rounded text-[10px] font-bold" title={tx.vetoReason}>
                          VETO CEO
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {tx.status === 'pending_approval' && (
                        <VetoButton
                          userRole={currentUser?.role}
                          targetId={tx.id}
                          targetType={`la transaction de ${formatMoney(tx.amount)}`}
                          onVetoExecuted={(targetId, reason) => onVeto(targetId, reason)}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODALE SAISIE TRANSACTION AVEC UPLOAD JUSTIFICATIF OBLIGATOIRE */}
      {showAddModal && (
        <div className="fixed inset-0 z-[220] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0B192C] border border-amber-500/40 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative text-white">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider font-serif">
                  Enregistrement Trésorerie CDS
                </h3>
                <p className="text-xs text-gray-400">Justificatif comptable obligatoire selon le règlement intérieur.</p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 bg-red-900/30 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              {/* TYPE TRANSACTION */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2.5 rounded-xl font-bold uppercase transition-all border ${
                    type === 'expense' 
                      ? 'bg-red-500/20 border-red-500 text-red-300' 
                      : 'bg-slate-900 border-slate-800 text-gray-400'
                  }`}
                >
                  Dépense (Sortie)
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2.5 rounded-xl font-bold uppercase transition-all border ${
                    type === 'income' 
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' 
                      : 'bg-slate-900 border-slate-800 text-gray-400'
                  }`}
                >
                  Recette (Entrée)
                </button>
              </div>

              {/* MONTANT & CATÉGORIE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 uppercase mb-1">Montant (FCFA) *</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ex: 500000"
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 font-extrabold"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 uppercase mb-1">Catégorie *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="frais_scolarite">Frais de Scolarité</option>
                    <option value="subvention">Subvention / Don</option>
                    <option value="partenariat">Partenariat</option>
                    <option value="equipement">Équipement & Matériel</option>
                    <option value="logistique">Logistique & Événementiel</option>
                    <option value="salaire">Salaires & Honoraires</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-gray-400 uppercase mb-1">Description institutionnelle *</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Exemple : Achat d'imprimantes et consommables pour le secrétariat"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 font-sans text-xs"
                />
              </div>

              {/* UPLOAD OBLIGATOIRE DU JUSTIFICATIF */}
              <div className="p-4 bg-slate-900/90 border-2 border-dashed border-amber-500/40 rounded-xl text-center">
                <label className="cursor-pointer block">
                  <Upload className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <span className="font-bold text-amber-300 block uppercase">
                    Upload Justificatif Obligatoire *
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-1">
                    Format : PDF, PNG, JPG (Max 5 Mo). Facture ou reçu requis.
                  </span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {proofPreview && (
                  <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Fichier attaché : {proofPreview}</span>
                  </div>
                )}
              </div>

              {/* ACTION SUBMIT */}
              <button
                type="submit"
                disabled={loading || !proofFile}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-black font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20"
              >
                {loading ? "Enregistrement en cours..." : "Soumettre à la Direction"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
