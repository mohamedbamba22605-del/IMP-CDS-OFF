// src/components/arsenal/MiniCRM.jsx
import React, { useState } from 'react';
import { Briefcase, UserPlus, Search, Award, CheckCircle, AlertTriangle, Eye, Shield, X, Mail, Smartphone, Globe } from '../ui/Icons';

export default function MiniCRM({ contacts = [], currentUser, onAddContact }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('partner');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dealValue, setDealValue] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('active');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg("Le nom du contact ou du partenaire est obligatoire.");
      return;
    }

    setLoading(true);
    try {
      await onAddContact({
        name,
        type,
        organization,
        email,
        phone,
        dealValue,
        notes,
        status
      });

      setName('');
      setOrganization('');
      setEmail('');
      setPhone('');
      setDealValue('');
      setNotes('');
      setShowAddModal(false);
    } catch (e) {
      setErrorMsg(e.message || "Erreur lors de l'enregistrement du contact.");
    } finally {
      setLoading(false);
    }
  };

  const safeContacts = Array.isArray(contacts) ? contacts : [];

  const filteredContacts = safeContacts.filter(c => {
    if (!c) return false;
    const search = searchTerm.toLowerCase();
    const matchesSearch = c.name?.toLowerCase().includes(search) ||
                          c.organization?.toLowerCase().includes(search) ||
                          c.email?.toLowerCase().includes(search);
    const matchesType = filterType === 'all' || c.type === filterType;
    return matchesSearch && matchesType;
  });

  const partnersCount = safeContacts.filter(c => c.type === 'partner').length;
  const ambassadorsCount = safeContacts.filter(c => c.type === 'ambassador').length;
  const totalValue = safeContacts.reduce((sum, c) => sum + (c.dealValue || 0), 0);

  const formatMoney = (val) => new Intl.NumberFormat('fr-FR').format(val || 0) + " FCFA";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* BANNIÈRE RECAPITULATIVE CRM */}
      <div className="p-6 bg-gradient-to-r from-[#0A1128] via-[#0B192C] to-[#1E1B4B] border border-purple-500/30 rounded-3xl shadow-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full text-xs font-mono font-bold">
              Mini-CRM Opérationnel
            </span>
            <span className="text-xs font-mono text-gray-400">Capital du Savoir</span>
          </div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-white font-serif">
            Gestion des Partenaires & Ambassadeurs
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Suivi des relations institutionnelles, mécènes, sponsors et ambassadeurs régionaux.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nouveau Partenaire / Ambassadeur</span>
        </button>
      </div>

      {/* KPI GRID CRM */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#0B192C]/80 border border-purple-500/30 rounded-2xl backdrop-blur-md text-white font-mono">
          <span className="text-xs text-gray-400 uppercase">Partenaires Officiels</span>
          <div className="text-2xl font-extrabold text-purple-400 mt-1">{partnersCount}</div>
        </div>

        <div className="p-4 bg-[#0B192C]/80 border border-pink-500/30 rounded-2xl backdrop-blur-md text-white font-mono">
          <span className="text-xs text-gray-400 uppercase">Ambassadeurs Actifs</span>
          <div className="text-2xl font-extrabold text-pink-400 mt-1">{ambassadorsCount}</div>
        </div>

        <div className="p-4 bg-[#0B192C]/80 border border-amber-500/30 rounded-2xl backdrop-blur-md text-white font-mono">
          <span className="text-xs text-gray-400 uppercase">Valeur Globale Engagements</span>
          <div className="text-xl font-extrabold text-amber-300 mt-1">{formatMoney(totalValue)}</div>
        </div>
      </div>

      {/* RECHERCHE ET FILTRES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#0B192C]/60 border border-slate-800 rounded-2xl text-white">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, organisation, email..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
          />
        </div>

        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400 font-mono"
          >
            <option value="all">Tous les Types de Contacts</option>
            <option value="partner">Partenaire Officiel</option>
            <option value="ambassador">Ambassadeur CDS</option>
            <option value="sponsor">Sponsor / Mécène</option>
            <option value="institution">Institution Publique</option>
          </select>
        </div>
      </div>

      {/* GRILLE DES CONTACTS CRM */}
      <div className="p-6 bg-[#0B192C]/80 border border-slate-800 rounded-2xl backdrop-blur-md shadow-xl text-white">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
          Répertoire du Réseau CDS ({filteredContacts.length})
        </h3>

        {filteredContacts.length === 0 ? (
          <p className="text-xs text-gray-500 italic text-center py-8">Aucun contact trouvé dans cette catégorie.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.map((contact) => (
              <div 
                key={contact.id}
                className="p-5 bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 rounded-2xl transition-all space-y-3 font-sans text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      contact.type === 'partner' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      contact.type === 'ambassador' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {contact.type === 'partner' ? 'Partenaire' : contact.type === 'ambassador' ? 'Ambassadeur' : contact.type}
                    </span>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      contact.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {contact.status === 'active' ? 'Actif' : 'Prospect'}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-white text-sm mb-0.5">{contact.name}</h4>
                  <p className="text-purple-300 text-xs font-mono mb-2">{contact.organization}</p>

                  <div className="space-y-1 font-mono text-[11px] text-gray-300 mb-3">
                    {contact.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span>{contact.email}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                  </div>

                  {contact.notes && (
                    <p className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-gray-400 italic line-clamp-2">
                      "{contact.notes}"
                    </p>
                  )}
                </div>

                {contact.dealValue > 0 && (
                  <div className="pt-2 border-t border-slate-800 font-mono text-[11px] flex justify-between items-center text-amber-300">
                    <span>Engagement Financier :</span>
                    <span className="font-bold">{formatMoney(contact.dealValue)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALE AJOUT CONTACT CRM */}
      {showAddModal && (
        <div className="fixed inset-0 z-[250] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0B192C] border border-purple-500/40 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative text-white">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider font-serif">
                  Nouveau Contact CRM CDS
                </h3>
                <p className="text-xs text-gray-400">Ajout d'un partenaire, sponsor ou ambassadeur affilié.</p>
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
                <label className="block text-gray-400 uppercase mb-1">Nom Complet ou Raison Sociale *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Fondation Éducation & Avenir / M. Jean Dupont"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400 font-sans text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 uppercase mb-1">Type de Contact *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="partner">Partenaire Officiel</option>
                    <option value="ambassador">Ambassadeur CDS</option>
                    <option value="sponsor">Sponsor / Mécène</option>
                    <option value="institution">Institution Publique</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 uppercase mb-1">Organisation / Entité</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Ex: Groupe Tech International"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400 font-sans text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 uppercase mb-1">Adresse Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@partenaire.org"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 uppercase mb-1">Téléphone Direct</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+221 77 000 00 00"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 uppercase mb-1">Valeur de l'Engagement (FCFA)</label>
                <input
                  type="number"
                  value={dealValue}
                  onChange={(e) => setDealValue(e.target.value)}
                  placeholder="Ex: 5000000 (Facultatif)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400 font-extrabold"
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase mb-1">Notes & Synergies Pédagogiques</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Précisions sur les modalités du partenariat, bourses ou soutien matériel..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400 font-sans text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold uppercase rounded-xl transition-all shadow-lg shadow-purple-500/20"
              >
                {loading ? "Enregistrement..." : "Ajouter au Répertoire CRM"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
