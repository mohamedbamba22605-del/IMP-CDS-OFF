// src/components/ui/HeaderNav.jsx
import React from 'react';
import { Shield, Castle, Radio, Briefcase, Cpu, UserCircle, LogOut } from './Icons';
import { ROLES, hasPermission } from '../../config/roles';

const NAV_TABS = [
  { key: 'pegazus',   label: 'Pégazus IAM',  Icon: Shield,   permission: 'view_pegazus',  color: 'from-amber-500 to-amber-600' },
  { key: 'citadelle', label: 'Citadelle',     Icon: Castle,   permission: 'view_citadelle', color: 'from-amber-500 to-amber-600' },
  { key: 'radio_qg',  label: 'Radio QG',      Icon: Radio,    permission: 'view_radio_qg',  color: 'from-amber-500 to-amber-600' },
  { key: 'arsenal',   label: 'Arsenal',       Icon: Briefcase, permission: 'view_arsenal',  color: 'from-amber-500 to-amber-600' },
  { key: 'jarvis',    label: 'Jarvis IA',     Icon: Cpu,      permission: 'use_jarvis',     color: 'from-amber-500 to-amber-600' },
];

export default function HeaderNav({ currentUser, activeTab, setActiveTab, onLogout, onOpenPegazus }) {
  const userRole = currentUser?.role || 'CEO';
  const roleObj = ROLES[userRole] || ROLES.CEO;

  // Filtre les onglets selon les permissions du rôle actif
  const visibleTabs = NAV_TABS.filter(tab => hasPermission(userRole, tab.permission));

  return (
    <header className="sticky top-0 z-[100] bg-[#0A1128]/95 backdrop-blur-xl border-b border-amber-500/20 shadow-2xl px-4 py-3 text-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">

        {/* BRANDING INSTITUTIONNEL */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-700 rounded-xl flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/20 border border-amber-400/50 select-none">
              <span className="text-lg font-black">C</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-wider uppercase text-white font-serif">Capital du Savoir</h1>
                <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold rounded-md font-mono">
                  CDS-EDITION
                </span>
              </div>
              <p className="text-[10px] text-gray-400 tracking-widest font-mono">
                AUDACE · INNOVATION · VISION — ERP v18.0 CDS
              </p>
            </div>
          </div>

          {/* Bouton mobile Pégazus */}
          {hasPermission(userRole, 'view_pegazus') && (
            <button
              onClick={onOpenPegazus}
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs font-bold text-amber-300"
            >
              <Shield className="w-4 h-4" />
              <span>IAM</span>
            </button>
          )}
        </div>

        {/* NAVIGATION DES MODULES (filtrée par rôle) */}
        <nav className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto w-full md:w-auto">
          {visibleTabs.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === key
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md shadow-amber-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}

          {/* Si aucun onglet visible → message accès minimal */}
          {visibleTabs.length === 0 && (
            <span className="px-4 py-2 text-xs text-gray-500 italic font-mono">
              Accès limité — Contactez le Secrétaire Général
            </span>
          )}
        </nav>

        {/* PROFIL UTILISATEUR */}
        <div className="hidden md:flex items-center gap-3">
          {/* Carte profil cliquable → Pégazus */}
          <div
            onClick={hasPermission(userRole, 'view_pegazus') ? onOpenPegazus : undefined}
            className={`flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl transition-all ${
              hasPermission(userRole, 'view_pegazus') ? 'cursor-pointer hover:border-amber-400/50' : 'cursor-default'
            }`}
            title={hasPermission(userRole, 'view_pegazus') ? 'Gérer les rôles Pégazus IAM' : roleObj.label}
          >
            <UserCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-left font-mono">
              <div className="text-xs font-bold text-white truncate max-w-[140px]">
                {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Officier CDS'}
              </div>
              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold border ${roleObj.badgeBg}`}>
                {roleObj.shortLabel || roleObj.id}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 transition-all"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
