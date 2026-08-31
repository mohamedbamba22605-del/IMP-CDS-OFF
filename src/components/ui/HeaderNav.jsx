// src/components/ui/HeaderNav.jsx
import React, { useState } from 'react';
import { Shield, Castle, Radio, Briefcase, Cpu, UserCircle, LogOut, Menu, X } from './Icons';
import { ROLES, hasPermission } from '../../config/roles';

const NAV_TABS = [
  { key: 'pegazus',   label: 'Pégazus IAM',  Icon: Shield,    permission: 'view_pegazus' },
  { key: 'citadelle', label: 'Citadelle',     Icon: Castle,    permission: 'view_citadelle' },
  { key: 'radio_qg',  label: 'Radio QG',      Icon: Radio,     permission: 'view_radio_qg' },
  { key: 'arsenal',   label: 'Arsenal',       Icon: Briefcase, permission: 'view_arsenal' },
  { key: 'jarvis',    label: 'Jarvis IA',     Icon: Cpu,       permission: 'use_jarvis' },
];

export default function HeaderNav({ currentUser, activeTab, setActiveTab, onLogout, onOpenPegazus }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userRole = currentUser?.role || 'EN_ATTENTE';
  const roleObj = ROLES[userRole] || ROLES.EN_ATTENTE;

  const visibleTabs = NAV_TABS.filter(tab => hasPermission(userRole, tab.permission));

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* HEADER AVEC PROTECTION SAFE AREA (IPHONE DYNAMIC ISLAND / NOTCH / ANDROID) */}
      <header 
        className="sticky top-0 z-[100] bg-[#0A1128]/98 backdrop-blur-2xl border-b border-amber-500/20 shadow-2xl px-3.5 sm:px-6 pb-2.5 sm:pb-3 text-white transition-all"
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 14px)',
          paddingLeft: 'max(env(safe-area-inset-left, 0px), 14px)',
          paddingRight: 'max(env(safe-area-inset-right, 0px), 14px)'
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">

          {/* ── BRANDING INSTITUTIONNEL ── */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 rounded-xl flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/20 border border-amber-400/50 shrink-0 select-none">
              <span className="text-base sm:text-lg font-black font-serif">C</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-xs sm:text-base font-extrabold tracking-wider uppercase text-white font-serif truncate max-w-[140px] sm:max-w-none">
                  Capital du Savoir
                </h1>
                <span className="px-1.5 sm:px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[8px] sm:text-[10px] font-bold rounded font-mono">
                  CDS
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-gray-400 tracking-widest font-mono hidden xs:block">
                AUDACE · INNOVATION · VISION
              </p>
            </div>
          </div>

          {/* ── NAVIGATION DESKTOP / TABLETTE (SCROLLABLE BAR) ── */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            {visibleTabs.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => handleTabClick(key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === key
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md shadow-amber-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* ── ACTIONS & PROFIL ── */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Profil desktop */}
            <div
              onClick={hasPermission(userRole, 'view_pegazus') ? onOpenPegazus : undefined}
              className={`hidden sm:flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl transition-all ${
                hasPermission(userRole, 'view_pegazus') ? 'cursor-pointer hover:border-amber-400/50' : 'cursor-default'
              }`}
              title={roleObj.label}
            >
              <UserCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left font-mono">
                <div className="text-[11px] font-bold text-white truncate max-w-[110px]">
                  {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Membre'}
                </div>
                <span className={`inline-block px-1 py-0.2 rounded text-[8px] font-bold border ${roleObj.badgeBg}`}>
                  {roleObj.shortLabel || roleObj.id}
                </span>
              </div>
            </div>

            {/* Déconnexion */}
            <button
              onClick={onLogout}
              className="p-2 sm:p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 transition-all shrink-0"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Bouton Hamburger Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 bg-slate-800/80 border border-slate-700 rounded-xl text-gray-300 transition-all shrink-0"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── NAVIGATION MOBILE SCROLL HORIZONTALE RAPIDE ── */}
        <div className="md:hidden mt-2 pt-2 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {visibleTabs.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => handleTabClick(key)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === key
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md shadow-amber-500/20'
                  : 'text-gray-400 bg-slate-900/60 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* ── TIROIR MOBILE COMPLET (DRAWER) ── */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-[150] bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
          style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 70px)' }}
        >
          <div className="bg-[#0B192C] border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            {/* Profil Mobile */}
            <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold font-mono">
                  {(currentUser?.displayName || currentUser?.email || 'M')[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-white text-xs">{currentUser?.displayName || currentUser?.email}</div>
                  <div className="text-[10px] text-gray-400 font-mono">{currentUser?.email}</div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border font-mono ${roleObj.badgeBg}`}>
                {roleObj.shortLabel || roleObj.id}
              </span>
            </div>

            {/* Liens de navigation */}
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase font-mono text-gray-400 px-2 font-bold">Modules Disponibles :</div>
              {visibleTabs.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => handleTabClick(key)}
                  className={`w-full p-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-between ${
                    activeTab === key
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20'
                      : 'text-gray-300 bg-slate-900/50 border border-slate-800/80 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </div>
                  <span className="text-[10px] font-mono opacity-60">Accéder →</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 font-bold text-xs uppercase font-mono flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Se Déconnecter de la Session</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
