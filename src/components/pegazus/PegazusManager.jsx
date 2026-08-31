// src/components/pegazus/PegazusManager.jsx
import React, { useState, useEffect } from 'react';
import { 
  Shield, Key, Lock, UserCircle, CheckCircle, AlertTriangle, 
  RefreshCw, Sparkles, Award, Eye, FileText, Check, 
  Users, UserCheck, Loader2, ArrowLeft 
} from '../ui/Icons';
import { ROLES, isCEO, isDG, canManageRoles, getAssignableRoles, getRolesOrdered } from '../../config/roles';
import { getAllUsers, updateUserRole, getSecurityLogs } from '../../services/rbacService';
import VoiceController from './VoiceController';

const LEVEL_BADGES = {
  1: { label: 'Niveau 1 — Direction Suprême',    bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300' },
  2: { label: 'Niveau 2 — Direction Générale',   bg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300' },
  3: { label: 'Niveau 3 — Secrétariat Général',  bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' },
  4: { label: 'Niveau 4 — Responsables',         bg: 'bg-purple-500/15 border-purple-500/40 text-purple-300' },
  5: { label: 'Niveau 5 — Adjoints',             bg: 'bg-slate-500/15 border-slate-500/40 text-slate-300' },
  6: { label: 'Niveau 6 — Staff',                bg: 'bg-slate-600/15 border-slate-600/40 text-slate-400' },
  7: { label: 'Niveau 7 — Collaborateurs Ext.',  bg: 'bg-pink-600/15 border-pink-600/40 text-pink-400' },
  8: { label: 'En Attente de Nomination',        bg: 'bg-gray-700/30 border-gray-600 text-gray-400' }
};

export default function PegazusManager({ currentUser, onRoleChange, onBack }) {
  const [usersList, setUsersList] = useState([]);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoleUpdates, setSelectedRoleUpdates] = useState({});
  const [updatingUid, setUpdatingUid] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const activeRoleObj = ROLES[currentUser?.role] || ROLES.EN_ATTENTE;
  const isManager = canManageRoles(currentUser?.role);
  const assignableRoles = getAssignableRoles();
  const orderedRoles = getRolesOrdered();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [users, logs] = await Promise.all([
        getAllUsers(),
        getSecurityLogs(20)
      ]);
      setUsersList(users);
      setSecurityLogs(logs);

      // Initialiser la sélection locale pour chaque utilisateur
      const initialRoles = {};
      users.forEach(u => {
        initialRoles[u.id || u.uid] = u.role || 'EN_ATTENTE';
      });
      setSelectedRoleUpdates(initialRoles);
    } catch (e) {
      console.warn("Erreur chargement données Pégazus:", e);
      setErrorMsg("Impossible de charger les effectifs Firestore.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelectionChange = (uid, roleKey) => {
    setSelectedRoleUpdates(prev => ({
      ...prev,
      [uid]: roleKey
    }));
  };

  const handlePromoteUser = async (targetUid, targetName) => {
    const newRole = selectedRoleUpdates[targetUid];
    if (!newRole) return;

    setUpdatingUid(targetUid);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await updateUserRole(targetUid, newRole, currentUser?.uid);
      const roleName = ROLES[newRole]?.label || newRole;
      setSuccessMsg(`Félicitations : ${targetName || 'Le membre'} a été officiellement nommé au poste de "${roleName}".`);
      
      // Si l'utilisateur modifié est soi-même, répercuter le changement
      if (targetUid === currentUser?.uid && onRoleChange) {
        onRoleChange(newRole);
      }

      await fetchData();
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (e) {
      console.error("Erreur nomination:", e);
      setErrorMsg(`Échec de la nomination: ${e.message}`);
    } finally {
      setUpdatingUid(null);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 pb-12 animate-in fade-in duration-300">

      {/* ── HEADER PÉGAZUS ── */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-[#0A1128] via-[#0B192C] to-[#102A43] border border-cyan-500/30 rounded-2xl sm:rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 rounded-xl sm:rounded-2xl flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/20 border border-amber-300/30 shrink-0">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-2xl font-black text-white uppercase tracking-wider font-serif">
                  Pégazus IAM & Effectifs
                </h1>
                <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 rounded-full text-[9px] sm:text-[10px] font-mono uppercase font-bold">
                  Note N°0002
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">
                Gouvernance, affectation des postes et contrôle d'accès de Capital du Savoir
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
            <button 
              onClick={fetchData} 
              className="p-2 sm:p-2.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-gray-300 transition-all flex items-center gap-1.5 text-xs font-mono" 
              title="Rafraîchir"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-[11px] sm:text-xs">Actualiser</span>
            </button>
            {onBack && (
              <button 
                onClick={onBack} 
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-slate-700 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Retour</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── SYNTHÈSE VOCALE PROACTIVE ── */}
      <VoiceController activeRole={activeRoleObj} />

      {/* ── MESSAGES D'ALERTE / SUCCÈS ── */}
      {successMsg && (
        <div className="p-3.5 sm:p-4 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs font-mono flex items-center gap-2.5 animate-in zoom-in-95 duration-200">
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 sm:p-4 bg-red-950/60 border border-red-500/50 rounded-2xl text-red-300 text-xs font-mono flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── SECTION 1 : GESTION DES EFFECTIFS (DG / CEO) ── */}
      {isManager && (
        <div className="p-4 sm:p-6 bg-[#0B192C]/90 border border-amber-500/30 rounded-2xl sm:rounded-3xl backdrop-blur-xl shadow-2xl text-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-white font-serif">
                  Attribution des Postes & Effectifs ({usersList.length})
                </h3>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
                Consultez tous les membres inscrits sur Firebase et nommez-les à l'un des 12 postes de la Note N°0002.
              </p>
            </div>

            <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] sm:text-[11px] font-mono font-bold rounded-full self-start sm:self-auto">
              Panneau d'Autorité {currentUser?.role}
            </span>
          </div>

          {loading ? (
            <div className="py-10 flex flex-col items-center justify-center gap-2 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              <span className="text-xs font-mono">Chargement des effectifs...</span>
            </div>
          ) : usersList.length === 0 ? (
            <div className="py-8 text-center text-gray-500 font-mono text-xs border border-dashed border-slate-800 rounded-2xl p-4">
              Aucun autre membre n'est encore connecté sur la base de données.
            </div>
          ) : (
            <>
              {/* VUE MOBILE (CARDS) */}
              <div className="md:hidden space-y-3">
                {usersList.map((user) => {
                  const uid = user.id || user.uid;
                  const currentRoleObj = ROLES[user.role] || ROLES.EN_ATTENTE;
                  const selectedRole = selectedRoleUpdates[uid] || user.role || 'EN_ATTENTE';
                  const isCurrentUser = uid === currentUser?.uid;
                  const isBusy = updatingUid === uid;
                  const hasChanged = selectedRole !== user.role;

                  return (
                    <div 
                      key={uid}
                      className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-3"
                    >
                      {/* En-tête membre */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold font-mono text-xs shrink-0">
                            {(user.displayName || user.email || 'M')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white text-xs truncate flex items-center gap-1.5">
                              <span>{user.displayName || user.email?.split('@')[0]}</span>
                              {isCurrentUser && (
                                <span className="px-1 py-0.2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded text-[8px] font-mono shrink-0">
                                  Vous
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono truncate">{user.email}</div>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border shrink-0 ${currentRoleObj.badgeBg}`}>
                          {currentRoleObj.shortLabel || currentRoleObj.label}
                        </span>
                      </div>

                      {/* Sélecteur & Action */}
                      <div className="space-y-2 pt-1 border-t border-slate-800/60">
                        <label className="block text-[10px] font-mono text-gray-400 uppercase">
                          Nommer au poste officiel :
                        </label>
                        <select
                          value={selectedRole}
                          onChange={(e) => handleRoleSelectionChange(uid, e.target.value)}
                          disabled={isBusy}
                          className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-mono focus:outline-none focus:border-amber-400"
                        >
                          <optgroup label="Postes Officiels CDS (Note N°0002)">
                            {assignableRoles.map((role) => (
                              <option key={role.id} value={role.id}>
                                Niv.{role.hierarchyLevel} — {role.label}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Statut Temporaire">
                            <option value="EN_ATTENTE">En Attente d'Affectation</option>
                          </optgroup>
                        </select>

                        <button
                          onClick={() => handlePromoteUser(uid, user.displayName || user.email)}
                          disabled={isBusy || !hasChanged}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                            hasChanged
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20'
                              : 'bg-slate-800/50 text-gray-600 cursor-not-allowed border border-slate-800'
                          }`}
                        >
                          {isBusy ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                          <span>{isBusy ? "Nomination..." : hasChanged ? "Valider la Nomination" : "Poste Actuel Confirmé"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* VUE DESKTOP (TABLEAU) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-gray-400 font-mono">
                      <th className="pb-3 pr-4">Membre / Identifiant</th>
                      <th className="pb-3 px-3">Poste Actuel</th>
                      <th className="pb-3 px-3">Affectation Officielle (12 Rôles CDS)</th>
                      <th className="pb-3 pl-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {usersList.map((user) => {
                      const uid = user.id || user.uid;
                      const currentRoleObj = ROLES[user.role] || ROLES.EN_ATTENTE;
                      const selectedRole = selectedRoleUpdates[uid] || user.role || 'EN_ATTENTE';
                      const isCurrentUser = uid === currentUser?.uid;
                      const isBusy = updatingUid === uid;
                      const hasChanged = selectedRole !== user.role;

                      return (
                        <tr key={uid} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold font-mono text-sm shrink-0">
                                {(user.displayName || user.email || 'M')[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{user.displayName || user.email?.split('@')[0]}</span>
                                  {isCurrentUser && (
                                    <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded text-[9px] font-mono">
                                      Vous
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-gray-400 font-mono">{user.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-3">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${currentRoleObj.badgeBg}`}>
                              {currentRoleObj.shortLabel || currentRoleObj.label}
                            </span>
                          </td>

                          <td className="py-4 px-3">
                            <select
                              value={selectedRole}
                              onChange={(e) => handleRoleSelectionChange(uid, e.target.value)}
                              disabled={isBusy}
                              className="w-full max-w-xs bg-slate-900 border border-slate-700 text-white rounded-xl p-2 text-xs font-mono focus:outline-none focus:border-amber-400"
                            >
                              <optgroup label="Postes Officiels CDS (Note N°0002)">
                                {assignableRoles.map((role) => (
                                  <option key={role.id} value={role.id}>
                                    Niv.{role.hierarchyLevel} — {role.label}
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="Statut Temporaire">
                                <option value="EN_ATTENTE">En Attente d'Affectation</option>
                              </optgroup>
                            </select>
                          </td>

                          <td className="py-4 pl-3 text-right">
                            <button
                              onClick={() => handlePromoteUser(uid, user.displayName || user.email)}
                              disabled={isBusy || !hasChanged}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 ml-auto ${
                                hasChanged
                                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/20'
                                  : 'bg-slate-800 text-gray-500 cursor-not-allowed border border-slate-700/50'
                              }`}
                            >
                              {isBusy ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <UserCheck className="w-3.5 h-3.5" />
                              )}
                              <span>{isBusy ? "Nomination..." : "Nommer au poste"}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── SECTION 2 : CARTE PROFIL & SESSION ACTIVE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* PROFIL ACTUEL */}
        <div className="p-4 sm:p-6 bg-[#0B192C]/80 border border-amber-500/20 rounded-2xl backdrop-blur-md shadow-xl text-white">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 mb-3 sm:mb-4">
            <UserCircle className="w-4 h-4" /> Votre Session Active
          </h3>

          <div className="space-y-2.5 sm:space-y-3 font-mono text-xs">
            {[
              { label: 'Identifiant', value: currentUser?.email || 'N/A', cls: 'text-white' },
              { label: 'Poste Officiel', value: activeRoleObj.label, cls: 'text-amber-300' },
              { label: 'Accréditation', value: `${activeRoleObj.level} / 100`, cls: 'text-cyan-400' },
              { label: 'Rang', value: `Niveau ${activeRoleObj.hierarchyLevel}`, cls: 'text-emerald-400' },
              { label: 'Veto CEO', value: activeRoleObj.canVeto ? 'ACTIVÉ (IRRÉVOCABLE)' : 'Non autorisé', cls: activeRoleObj.canVeto ? 'text-emerald-400' : 'text-gray-500' },
            ].map(({ label, value, cls }) => (
              <div key={label} className="p-2.5 sm:p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex justify-between items-center gap-2">
                <span className="text-gray-400 text-[11px] shrink-0">{label} :</span>
                <span className={`${cls} font-bold text-right text-[11px] sm:text-xs truncate`}>{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <span className={`inline-block px-4 py-1.5 rounded-full border font-bold text-xs font-mono ${activeRoleObj.badgeBg}`}>
              {activeRoleObj.shortLabel || activeRoleObj.id}
            </span>
          </div>
        </div>

        {/* APERÇU DE LA HIÉRARCHIE OFFICIELLE */}
        <div className="lg:col-span-2 p-4 sm:p-6 bg-[#0B192C]/80 border border-slate-800 rounded-2xl backdrop-blur-md shadow-xl text-white overflow-y-auto max-h-[460px]">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-2">
            <Award className="w-4 h-4" /> Structure des 12 Postes Officiels CDS
          </h3>
          <p className="text-[11px] sm:text-xs text-gray-400 mb-4">
            Définie par la Note d'Information N° 0002 de Capital du Savoir.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {orderedRoles.map((role) => (
              <div 
                key={role.id}
                className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: role.color }} />
                    <span>{role.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">Niv.{role.hierarchyLevel}</span>
                </div>
                <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 3 : POUVOIR DE VETO CEO INSTITUTIONNEL ── */}
      <div className="p-4 sm:p-6 bg-gradient-to-br from-red-950/30 via-[#0B192C] to-[#0A1128] border border-red-500/30 rounded-2xl shadow-xl text-white">
        <div className="flex items-start sm:items-center gap-3 mb-3">
          <span className="p-2 bg-red-600/20 text-red-400 rounded-lg border border-red-500/30 shrink-0">
            <Shield className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white">
              Gouvernance du Veto Irrévocable (Exclusivité CEO)
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
              Conformément à la Note N°0002, Art. V : le CEO exerce un droit de veto absolu et sans recours sur tout décaissement budgétaire ou projet TDR.
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Statut du Dispositif :</span>
            <span className="text-emerald-400 font-bold">Actif en continu sur Citadelle & Arsenal</span>
          </div>
          <span className="text-[10px] text-gray-500">
            {isCEO(currentUser?.role) ? "👑 Vous disposez des pleins pouvoirs de Veto" : "🔒 Réservé au Chef d'Entreprise"}
          </span>
        </div>
      </div>

      {/* ── SECTION 4 : JOURNAUX DE SÉCURITÉ FIRESTORE ── */}
      <div className="p-4 sm:p-6 bg-[#0B192C]/80 border border-slate-800 rounded-2xl backdrop-blur-md shadow-xl text-white">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
          <Lock className="w-4 h-4" /> Registre des Événements & Nominations Pégazus
        </h3>

        {securityLogs.length === 0 ? (
          <p className="text-xs text-gray-500 italic font-mono">Aucun événement de sécurité pour le moment.</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {securityLogs.map((log) => (
              <div key={log.id} className="p-2.5 sm:p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] sm:text-xs font-mono">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 rounded text-[9px] font-bold shrink-0">{log.eventType}</span>
                  <span className="text-gray-300 truncate">{log.description}</span>
                </div>
                <span className="text-[9px] sm:text-[10px] text-gray-500 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
