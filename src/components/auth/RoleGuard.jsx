// src/components/auth/RoleGuard.jsx
import React from 'react';
import { Shield, Lock, AlertTriangle } from '../ui/Icons';
import { ROLES, hasPermission, isCEO } from '../../config/roles';

/**
 * RoleGuard Component
 * Usage:
 * <RoleGuard userRole={currentUser.role} requiredPermission="manage_treasury">
 *    <TreasuryContent />
 * </RoleGuard>
 */
export default function RoleGuard({ 
  userRole, 
  requiredPermission, 
  requiredRole, 
  requireCEO = false,
  fallback = null, 
  children 
}) {
  const roleId = typeof userRole === 'string' ? userRole : userRole?.id || 'CEO';

  let isAuthorized = true;

  if (requireCEO && !isCEO(roleId)) {
    isAuthorized = false;
  } else if (requiredRole && roleId !== requiredRole) {
    isAuthorized = false;
  } else if (requiredPermission && !hasPermission(roleId, requiredPermission)) {
    isAuthorized = false;
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  if (fallback) {
    return fallback;
  }

  const roleInfo = ROLES[roleId] || ROLES.CEO;

  return (
    <div className="p-6 bg-[#0B192C]/80 border border-red-500/30 rounded-2xl backdrop-blur-md text-center max-w-md mx-auto my-6 shadow-xl animate-in fade-in zoom-in duration-300">
      <div className="w-16 h-16 bg-red-500/10 border border-red-500/40 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
        <Lock className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
        <Shield className="w-5 h-5 text-red-400" /> Accès Restreint Pégazus
      </h3>
      <p className="text-gray-400 text-xs mb-4 leading-relaxed">
        Votre grade actuel (<span className="text-amber-400 font-semibold">{roleInfo.label}</span>) ne dispose pas des privilèges nécessaires pour accéder à cette zone institutionnelle.
      </p>
      {requireCEO && (
        <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-red-300 text-xs flex items-center justify-center gap-2 font-mono">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>Privilège Veto Exclusif au CEO</span>
        </div>
      )}
    </div>
  );
}
