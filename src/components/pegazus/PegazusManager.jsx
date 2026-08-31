// src/components/pegazus/PegazusManager.jsx
import React, { useState, useEffect } from 'react';
import { 
  Shield, Key, Lock, UserCircle, CheckCircle, AlertTriangle, 
  RefreshCw, Sparkles, Award, Eye, FileText, Check, 
  Users, UserCheck, Loader2 
} from '../ui/Icons';
import { ROLES, isCEO, isDG, canManageRoles, getAssignableRoles, getRolesOrdered } from '../../config/roles';
import { getAllUsers, updateUserRole, getSecurityLogs } from '../../services/rbacService';
import VoiceController from './VoiceController';
import VetoButton from './VetoButton';

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

  const [vetoDemoState, setVetoDemoState] = useState({
    id: "DEMO-TX-104",
    title: "Achat d'équipements informatiques pour le Campus CDS",
    amount: "1 250 000 FCFA",
    status: "pending",
    vetoReason: ""
  });

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
      setErrorMsg("Impossible de charger la liste complète des utilisateurs Firestore.");
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
      setSuccessMsg(`Félicitations : ${targetName || 'L\'utilisateur'} a été officiellement nommé au poste de "${roleName}".`);
      
      // Si l'utilisateur modifié est soi-même, répercuter le changement
      if (targetUid === currentUser?.uid && onRoleChange) {
        onRoleChange(newRole);
      }

      await fetchData();
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (e) {
      console.error("Erreur promotion:", e);
      setErrorMsg(`Échec de la nomination: ${e.message}`);
    } finally {
      setUpdatingUid(null);
    }
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
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 rounded-2xl flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/20 border border-amber-300/30">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white uppercase tracking-wider font-serif">Pégazus IAM & Effectifs CDS</h1>
                <span className="px-2.5 py-0.5 bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 rounded-full text-[10px] font-mono uppercase font-bold">
                  Note N°0002
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Gouvernance, affectation des postes officiels et contrôle d'accès de Capital du Savoir
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchData} 
              className="p-2.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-gray-300 transition-all flex items-center gap-2 text-xs font-mono" 
              title="Rafraîchir les données"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
            {onBack && (
              <button 
                onClick={onBack} 
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-slate-700"
              >
                Retour
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── SYNTHÈSE VOCALE PROACTIVE ── */}
      <VoiceController activeRole={activeRoleObj} />

      {/* ── MESSAGES D'ALERTE / SUCCÈS ── */}
      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs font-mono flex items-center gap-3 animate-in zoom-in-95 duration-200">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-950/60 border border-red-500/50 rounded-2xl text-red-300 text-xs font-mono flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── SECTION 1 : GESTION RÉELLE DES UTILISATEURS FIRESTORE (DG / CEO) ── */}
      {isManager && (
        <div className="p-6 bg-[#0B192C]/90 border border-amber-500/30 rounded-3xl backdrop-blur-xl shadow-2xl text-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-extrabold uppercase tracking-wider text-white font-serif">
                  Attribution des Postes & Effectifs Officiels ({usersList.length})
                </h3>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Consultez tous les membres inscrits sur Firebase et nommez-les à l'un des 12 postes de la Note N°0002.
              </p>
            </div>

            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold rounded-full self-start sm:self-auto">
              Panneau d'Autorité {currentUser?.role}
            </span>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              <span className="text-xs font-mono">Chargement des effectifs Firestore...</span>
            </div>
          ) : usersList.length === 0 ? (
            <div className="py-10 text-center text-gray-500 font-mono text-xs border border-dashed border-slate-800 rounded-2xl">
              Aucun autre membre n'est encore connecté sur la nouvelle base de données Firebase.
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                        {/* Identité */}
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold font-mono text-sm shrink-0">
                              {(user.displayName || user.email || 'O')[0].toUpperCase()}
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
                              <div className="text-[9px] text-gray-500 font-mono">
                                Inscrit le : {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'Récemment'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Rôle Actuel */}
                        <td className="py-4 px-3">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${currentRoleObj.badgeBg}`}>
                            {currentRoleObj.shortLabel || currentRoleObj.label}
                          </span>
                        </td>

                        {/* Sélecteur des 12 Rôles Officiels */}
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

                        {/* Bouton Nommer */}
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
          )}
        </div>
      )}

      {/* ── SECTION 2 : CARTE PROFIL & SESSION ACTIVE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* PROFIL ACTUEL */}
        <div className="p-6 bg-[#0B192C]/80 border border-amber-500/20 rounded-2xl backdrop-blur-md shadow-xl text-white">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 mb-4">
            <UserCircle className="w-4 h-4" /> Votre Session Officielle
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {[
              { label: 'Identifiant', value: currentUser?.email || 'N/A', cls: 'text-white' },
              { label: 'Poste Officiel', value: activeRoleObj.label, cls: 'text-amber-300' },
              { label: 'Niveau Accréditation', value: `${activeRoleObj.level} / 100`, cls: 'text-cyan-400' },
              { label: 'Rang Hiérarchique', value: `Niveau ${activeRoleObj.hierarchyLevel}`, cls: 'text-emerald-400' },
              { label: 'Veto CEO', value: activeRoleObj.canVeto ? 'ACTIVÉ (IRRÉVOCABLE)' : 'Non autorisé', cls: activeRoleObj.canVeto ? 'text-emerald-400' : 'text-gray-500' },
            ].map(({ label, value, cls }) => (
              <div key={label} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex justify-between items-center gap-3">
                <span className="text-gray-400 shrink-0">{label} :</span>
                <span className={`${cls} font-bold text-right`}>{value}</span>
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
        <div className="lg:col-span-2 p-6 bg-[#0B192C]/80 border border-slate-800 rounded-2xl backdrop-blur-md shadow-xl text-white overflow-y-auto max-h-[460px]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-2">
            <Award className="w-4 h-4" /> Structure des 12 Postes Officiels CDS
          </h3>
          <p className="text-xs text-gray-400 mb-4">
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

      {/* ── SECTION 3 : VETO CEO IRRÉVOCABLE ── */}
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
            userRole={currentUser?.role}
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

      {/* ── SECTION 4 : JOURNAUX DE SÉCURITÉ FIRESTORE ── */}
      <div className="p-6 bg-[#0B192C]/80 border border-slate-800 rounded-2xl backdrop-blur-md shadow-xl text-white">
        <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4" /> Registre des Événements & Nominations Pégazus
        </h3>

        {securityLogs.length === 0 ? (
          <p className="text-xs text-gray-500 italic">Aucun événement de sécurité enregistré pour le moment.</p>
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
