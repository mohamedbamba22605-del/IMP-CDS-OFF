// src/components/pegazus/PegazusManager.jsx
import React, { useState, useEffect } from 'react';
import { Shield, Key, Lock, UserCircle, CheckCircle, AlertTriangle, RefreshCw, Sparkles, Award, Eye, FileText, Check } from '../ui/Icons';
import { ROLES, isCEO, getRolesOrdered } from '../../config/roles';
import { getAllUsers, updateUserRole, getSecurityLogs } from '../../services/rbacService';
import VoiceController from './VoiceController';
import VetoButton from './VetoButton';

// Badges de niveau hiérarchique
const LEVEL_BADGES = {
  1: { label: 'Niveau 1 — Direction Suprême',    bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300' },
  2: { label: 'Niveau 2 — Direction Générale',   bg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300' },
  3: { label: 'Niveau 3 — Secrétariat Général',  bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' },
  4: { label: 'Niveau 4 — Responsables',         bg: 'bg-purple-500/15 border-purple-500/40 text-purple-300' },
  5: { label: 'Niveau 5 — Adjoints',             bg: 'bg-slate-500/15 border-slate-500/40 text-slate-300' },
  6: { label: 'Niveau 6 — Staff',                bg: 'bg-slate-600/15 border-slate-600/40 text-slate-400' },
  7: { label: 'Niveau 7 — Collaborateurs Ext.',  bg: 'bg-pink-600/15 border-pink-600/40 text-pink-400' },
};

export default function PegazusManager({ currentUser, onRoleChange, onBack }) {
  const [securityLogs, setSecurityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(currentUser?.role || 'CEO');
  const [vetoDemoState, setVetoDemoState] = useState({
    id: "DEMO-TX-104",
    title: "Achat d'équipements informatiques pour le Campus CDS",
    amount: "1 250 000 FCFA",
    status: "pending",
    vetoReason: ""
  });

  const activeRoleId = currentUser?.role || selectedRole;
  const activeRoleObj = ROLES[activeRoleId] || ROLES.CEO;
  const orderedRoles = getRolesOrdered();

  // Regrouper les rôles par niveau hiérarchique
  const rolesByLevel = orderedRoles.reduce((acc, role) => {
    const lvl = role.hierarchyLevel;
    if (!acc[lvl]) acc[lvl] = [];
    acc[lvl].push(role);
    return acc;
  }, {});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const logs = await getSecurityLogs(15);
      setSecurityLogs(logs);
    } catch (e) {
      console.warn("Erreur chargement journaux Pégazus:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    if (onRoleChange) onRoleChange(roleKey);
  };

  const handleExecuteVetoDemo = async (targetId, reason) => {
    setVetoDemoState(prev => ({ ...prev, status: "vetoed", vetoReason: reason }));
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">

      {/* ── HEADER PÉGAZUS ── */}
      <div className="p-6 bg-gradient-to-r from-[#0A1128] via-[#0B192C] to-[#102A43] border border-cyan-500/30 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-amber-400 to-amber-700 rounded-2xl text-black shadow-lg shadow-amber-500/20">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white uppercase tracking-wider font-serif">Pégazus — Gestion des Rôles CDS</h1>
                <span className="px-2.5 py-0.5 bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 rounded-full text-[10px] font-mono uppercase font-bold">IAM v18.0 CDS</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Contrôle d'accès basé sur la hiérarchie officielle Capital du Savoir — Note N°0002
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-gray-300 transition-all" title="Rafraîchir">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {onBack && (
              <button onClick={onBack} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-slate-700">
                Retour
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── SYNTHÈSE VOCALE ── */}
      <VoiceController activeRole={activeRoleObj} />

      {/* ── PROFIL ACTUEL + SÉLECTEUR DE RÔLE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* CARTE PROFIL */}
        <div className="p-6 bg-[#0B192C]/80 border border-amber-500/20 rounded-2xl backdrop-blur-md shadow-xl text-white">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 mb-4">
            <UserCircle className="w-4 h-4" /> Session Active
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {[
              { label: 'Identifiant', value: currentUser?.email || 'admin@capitaldusavoir.org', cls: 'text-white' },
              { label: 'Poste Officiel', value: activeRoleObj.label, cls: 'text-amber-300' },
              { label: 'Accréditation', value: `${activeRoleObj.level} / 100`, cls: 'text-cyan-400' },
              { label: 'Niveau Hiéarchique', value: `Niveau ${activeRoleObj.hierarchyLevel}`, cls: 'text-emerald-400' },
              { label: 'Veto CEO', value: activeRoleObj.canVeto ? 'ACTIVÉ (IRRÉVOCABLE)' : 'Non autorisé', cls: activeRoleObj.canVeto ? 'text-emerald-400' : 'text-gray-500' },
            ].map(({ label, value, cls }) => (
              <div key={label} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex justify-between items-center gap-3">
                <span className="text-gray-400 shrink-0">{label} :</span>
                <span className={`${cls} font-bold text-right`}>{value}</span>
              </div>
            ))}
          </div>

          {/* Badge du rôle */}
          <div className="mt-4 text-center">
            <span className={`inline-block px-4 py-1.5 rounded-full border font-bold text-xs font-mono ${activeRoleObj.badgeBg}`}>
              {activeRoleObj.shortLabel || activeRoleObj.id}
            </span>
          </div>
        </div>

        {/* SÉLECTEUR DE RÔLE HIÉRARCHIQUE */}
        <div className="lg:col-span-2 p-6 bg-[#0B192C]/80 border border-slate-800 rounded-2xl backdrop-blur-md shadow-xl text-white overflow-y-auto max-h-[520px]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-2">
            <Key className="w-4 h-4" /> Simulation d'Attribution de Rôle (RBAC)
          </h3>
          <p className="text-xs text-gray-400 mb-5">
            Sélectionnez un poste officiel pour simuler les permissions correspondantes dans l'ERP.<br />
            <span className="text-amber-400 font-bold">Conforme à la Note d'Information N°0002 — Capital du Savoir.</span>
          </p>

          <div className="space-y-5">
            {Object.entries(rolesByLevel).map(([lvl, roles]) => {
              const badge = LEVEL_BADGES[parseInt(lvl)];
              return (
                <div key={lvl}>
                  {/* En-tête de niveau */}
                  <div className={`inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-mono font-bold mb-2 ${badge.bg}`}>
                    {badge.label}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {roles.map((role) => {
                      const isSelected = activeRoleId === role.id;
                      return (
                        <button
                          key={role.id}
                          onClick={() => handleRoleSelect(role.id)}
                          className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                            isSelected
                              ? 'bg-slate-800 border-amber-400/80 shadow-lg shadow-amber-500/10'
                              : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 p-1 bg-amber-400 rounded-full text-black">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: role.color }} />
                            <div>
                              <div className="font-bold text-xs text-white leading-tight pr-5">{role.label}</div>
                              <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">{role.description}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── VETO CEO ── */}
      <div className="p-6 bg-gradient-to-br from-red-950/30 via-[#0B192C] to-[#0A1128] border border-red-500/30 rounded-2xl shadow-xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-red-600/20 text-red-400 rounded-lg border border-red-500/30">
                <Shield className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold uppercase tracking-wider text-white">Veto Irrévocable — Exclusivité CEO</h3>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Conformément à la Note N°0002, Art. V : le CEO conserve un droit de veto sur toutes les décisions stratégiques.
            </p>
          </div>
          <VetoButton
            userRole={activeRoleId}
            targetId={vetoDemoState.id}
            targetType={vetoDemoState.title}
            onVetoExecuted={handleExecuteVetoDemo}
          />
        </div>

        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <span className="text-[10px] uppercase font-mono text-gray-500">Document / Transaction Test :</span>
            <h4 className="text-xs font-bold text-white">{vetoDemoState.title} ({vetoDemoState.amount})</h4>
          </div>
          {vetoDemoState.status === 'pending' ? (
            <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 rounded-full text-xs font-bold">
              En Attente de Validation
            </span>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <span className="px-3 py-1 bg-red-600/30 border border-red-500/50 text-red-300 rounded-full text-xs font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> VETO CEO APPLIQUÉ (IRRÉVOCABLE)
              </span>
              <span className="text-[10px] text-red-400 font-mono">Motif : {vetoDemoState.vetoReason}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── MATRICE DES PERMISSIONS ── */}
      <div className="p-6 bg-[#0B192C]/80 border border-slate-800 rounded-2xl backdrop-blur-md shadow-xl text-white">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          Privilèges autorisés pour : <span className="text-amber-300">{activeRoleObj.label}</span>
        </h3>

        {activeRoleObj.permissions.length === 0 ? (
          <p className="text-xs text-gray-500 italic font-mono">Aucun privilège système — Accès invité uniquement.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activeRoleObj.permissions.map((perm) => (
              <div key={perm} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-2 text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-mono text-gray-300">{perm}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── JOURNAUX DE SÉCURITÉ ── */}
      <div className="p-6 bg-[#0B192C]/80 border border-slate-800 rounded-2xl backdrop-blur-md shadow-xl text-white">
        <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4" /> Registre des Événements de Sécurité Pégazus
        </h3>

        {securityLogs.length === 0 ? (
          <p className="text-xs text-gray-500 italic">Aucun événement de sécurité enregistré.</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {securityLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded text-[10px] font-bold">{log.eventType}</span>
                  <span className="text-gray-300">{log.description}</span>
                </div>
                <span className="text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
