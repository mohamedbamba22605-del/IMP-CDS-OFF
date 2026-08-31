// src/components/jarvis/JarvisAssistant.jsx
import React, { useState, useEffect } from 'react';
import TDRGenerator from './TDRGenerator';
import SocialPostGenerator from './SocialPostGenerator';
import { Cpu, Sparkles, FileText, Globe, MessageSquare, AlertTriangle, Send, Loader2 } from '../ui/Icons';
import { getUserQuota } from '../../services/jarvisService';

export default function JarvisAssistant({ currentUser, onSendTdrToArsenal }) {
  const [activeSubTab, setActiveSubTab] = useState('tdr');
  const [quota, setQuota] = useState({ count: 0, limit: 100, remaining: 100 });
  const [loadingQuota, setLoadingQuota] = useState(true);

  // Pour le Chatbot
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'jarvis',
      text: "Bonjour Officier. Je suis Jarvis, l'assistant IA institutionnel de Capital du Savoir. Comment puis-je vous aider dans la gestion administrative, la rédaction de TDR ou la communication aujourd'hui ?"
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    fetchQuota();
  }, [currentUser]);

  const fetchQuota = async () => {
    setLoadingQuota(true);
    try {
      const q = await getUserQuota(currentUser?.uid);
      setQuota(q);
    } catch (e) {
      console.warn("Erreur récupération quota Jarvis:", e);
    } finally {
      setLoadingQuota(false);
    }
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setChatLoading(true);

    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'jarvis',
          text: `[Jarvis CDS] Concernant "${userText}", conformément au règlement intérieur et aux directives exécutoires de Capital du Savoir, les procédures prévoient la soumission d'un reporting triennal au Secrétariat Général et l'accord préalable de la Direction.`
        }
      ]);
      setChatLoading(false);
    }, 1000);
  };

  const quotaPercent = Math.min(100, Math.round((quota.count / quota.limit) * 100));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* HEADER QUOTA FIRESTORE JARVIS */}
      <div className="p-6 bg-gradient-to-r from-[#0A1128] via-[#0B192C] to-[#1E1B4B] border border-cyan-500/30 rounded-3xl shadow-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3.5 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl text-black font-black shadow-lg shadow-cyan-500/20">
            <Cpu className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white uppercase tracking-wider font-serif">Jarvis IA Intégrée</h1>
              <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-[10px] font-mono font-bold">
                Firestore Quota Active
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Assistant rédactionnel d'élite pour les Termes de Référence (TDR) et les médias sociaux.
            </p>
          </div>
        </div>

        {/* INDICATEUR DE QUOTA D'API DANS FIRESTORE */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl font-mono text-xs w-full md:w-72 shadow-inner">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-gray-400 text-[10px] uppercase font-bold">Quota Mensuel API :</span>
            <span className="text-cyan-300 font-extrabold">{quota.count} / {quota.limit}</span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
            <div 
              className={`h-full transition-all duration-500 ${quotaPercent > 80 ? 'bg-red-500' : quotaPercent > 50 ? 'bg-amber-400' : 'bg-cyan-400'}`}
              style={{ width: `${quotaPercent}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-gray-400">
            <span>Restantes : <strong className="text-emerald-400 font-bold">{quota.remaining}</strong></span>
            <span className="text-gray-500">Mois : {new Date().toISOString().slice(0, 7)}</span>
          </div>
        </div>
      </div>

      {/* NAVIGATION SECONDAIRE JARVIS */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('tdr')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeSubTab === 'tdr'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg'
              : 'text-gray-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Générateur de TDR</span>
        </button>

        <button
          onClick={() => setActiveSubTab('social')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeSubTab === 'social'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg'
              : 'text-gray-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Posts Réseaux Sociaux</span>
        </button>

        <button
          onClick={() => setActiveSubTab('chat')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeSubTab === 'chat'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-lg'
              : 'text-gray-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat Institutionnel</span>
        </button>
      </div>

      {/* SOUS-CONTENU JARVIS */}
      {activeSubTab === 'tdr' && (
        <TDRGenerator
          currentUser={currentUser}
          onQuotaUpdate={fetchQuota}
          onSendToArsenal={onSendTdrToArsenal}
        />
      )}

      {activeSubTab === 'social' && (
        <SocialPostGenerator
          currentUser={currentUser}
          onQuotaUpdate={fetchQuota}
        />
      )}

      {activeSubTab === 'chat' && (
        <div className="p-6 bg-[#0B192C]/90 border border-slate-800 rounded-3xl backdrop-blur-md shadow-2xl text-white space-y-4 font-sans">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-serif">
              Dialogue Direct avec Jarvis CDS
            </h3>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto p-3 bg-slate-950/70 border border-slate-800 rounded-2xl">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-2xl text-xs max-w-xl ${
                  msg.sender === 'jarvis'
                    ? 'bg-slate-900 border border-cyan-500/30 text-gray-200 mr-auto font-sans'
                    : 'bg-indigo-600 text-white ml-auto font-sans font-medium'
                }`}
              >
                <div className="text-[10px] font-mono text-gray-400 mb-1">
                  {msg.sender === 'jarvis' ? 'Jarvis IA' : currentUser?.displayName || 'Vous'}
                </div>
                {msg.text}
              </div>
            ))}

            {chatLoading && (
              <div className="p-3 bg-slate-900 border border-cyan-500/30 text-gray-400 text-xs rounded-2xl max-w-xs flex items-center gap-2 font-mono">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Jarvis analyse la demande...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendChatMessage} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Posez votre question sur les procédures, règlements ou projets..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-400 font-sans"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || chatLoading}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs uppercase rounded-xl transition-all flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
