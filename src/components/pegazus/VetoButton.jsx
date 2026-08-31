// src/components/pegazus/VetoButton.jsx
import React, { useState } from 'react';
import { Shield, Skull, AlertTriangle, CheckCircle, X } from '../ui/Icons';
import { isCEO } from '../../config/roles';

/**
 * VetoButton Component
 * Bouton Veto Irrévocable exclusif au CEO pour annuler/bloquer une action ou transaction
 */
export default function VetoButton({ 
  userRole, 
  targetId, 
  targetType = "la transaction", 
  onVetoExecuted,
  className = "" 
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const canUseVeto = isCEO(userRole);

  if (!canUseVeto) {
    return null; // Invisible pour les non-CEO
  }

  const handleConfirmVeto = async () => {
    if (!reason.trim()) {
      alert("Veuillez saisir le motif institutionnel du Veto.");
      return;
    }
    setLoading(true);

    try {
      if (onVetoExecuted) {
        await onVetoExecuted(targetId, reason);
      }
      // Effet visuel & sonore
      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 300]);
      setShowConfirm(false);
      setReason("");
    } catch (e) {
      console.error("Erreur exécution Veto CEO:", e);
      alert("Erreur lors de l'application du Veto: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className={`px-4 py-2 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-900/40 border border-red-500/50 transition-all flex items-center gap-2 animate-pulse hover:animate-none ${className}`}
        title="Droit de Veto Irrévocable du CEO"
      >
        <Shield className="w-4 h-4 text-amber-300" />
        <span>Veto CEO</span>
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-[#0B192C] border-2 border-red-600/80 w-full max-w-md rounded-2xl p-6 shadow-2xl relative text-white">
            <button 
              onClick={() => setShowConfirm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-600/20 border border-red-500/50 rounded-xl text-red-500">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-red-500 uppercase tracking-wider">
                  Veto Irrévocable du CEO
                </h3>
                <p className="text-xs text-gray-400">Capital du Savoir - Pouvoir de Direction</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 mb-4 leading-relaxed">
              Vous allez exercer votre droit de <strong className="text-red-400">Veto suprême</strong> sur {targetType}. Cette décision est définitive et bloquera immédiatement l'opération.
            </p>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Motif institutionnel du Veto (Obligatoire) :
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Exemple : Non-conformité aux exigences budgétaires ou statutaires de Capital du Savoir."
                className="w-full bg-slate-900 border border-red-500/40 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-400 font-mono h-24"
                autoFocus
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmVeto}
                disabled={loading || !reason.trim()}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Application..." : "Confirmer le Veto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
