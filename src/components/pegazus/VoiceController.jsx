// src/components/pegazus/VoiceController.jsx
import React, { useState, useEffect } from 'react';
import { Radio, Volume2, VolumeX, Sparkles, Cpu, CheckCircle2 } from '../ui/Icons';

/**
 * VoiceController Component
 * Synthèse vocale tactique et proactive pour Pégazus IAM
 */
export default function VoiceController({ activeRole }) {
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem('pegazus_voice_enabled') !== 'false';
  });
  const [speaking, setSpeaking] = useState(false);
  const [lastSpeech, setLastSpeech] = useState("Pégazus Système Vocal en ligne");

  useEffect(() => {
    localStorage.setItem('pegazus_voice_enabled', enabled ? 'true' : 'false');
  }, [enabled]);

  const speakText = (text, priority = false) => {
    if (!enabled && !priority) return;
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Stoppe toute annonce en cours
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.pitch = 1.0;
      utterance.rate = 1.05;

      utterance.onstart = () => {
        setSpeaking(true);
        setLastSpeech(text);
      };
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Erreur synthèse vocale:", e);
    }
  };

  const handleTestVoice = () => {
    const roleLabel = activeRole?.label || 'CEO';
    const message = `Pégazus IAM actif. Grade de commandement identifié : ${roleLabel}. Capital du Savoir opérationnel.`;
    speakText(message, true);
  };

  return (
    <div className="p-4 bg-[#0B192C]/90 border border-cyan-500/30 rounded-2xl backdrop-blur-lg shadow-xl text-white">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${speaking ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 animate-pulse' : 'bg-slate-800/60 border-slate-700 text-gray-400'}`}>
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-cyan-400 uppercase tracking-wider">Interface Vocale Pégazus</h4>
              {speaking && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400 font-mono truncate max-w-xs">{lastSpeech}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestVoice}
            className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-xs font-semibold text-cyan-300 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tester</span>
          </button>

          <button
            onClick={() => setEnabled(!enabled)}
            className={`p-2 rounded-lg border transition-all ${enabled ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
            title={enabled ? "Désactiver la voix" : "Activer la voix"}
          >
            {enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
