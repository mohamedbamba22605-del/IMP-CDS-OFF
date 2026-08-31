import React, { useState, useCallback } from 'react';
import { AlertTriangle, Skull, CheckCircle, Zap, Info } from 'lucide-react';

// ==========================================
// SYSTÈME DE COMMUNICATION JARVIS (HUD TACTIQUE)
// ==========================================
const JarvisContext = React.createContext();
export const useJarvis = () => React.useContext(JarvisContext);

export const JarvisProvider = ({ children }) => {
    const [dialog, setDialog] = useState({ 
        isOpen: false, type: 'alert', title: '', message: '', theme: 'info', onConfirm: null, onCancel: null 
    });

    const showAlert = useCallback((title, message, theme = 'info') => {
        if(window.triggerVibration) triggerVibration(theme === 'error' ? 'error' : 'light');
        setDialog({ 
            isOpen: true, type: 'alert', title, message, theme, 
            onConfirm: () => setDialog(prev => ({ ...prev, isOpen: false })) 
        });
    }, []);

    const showConfirm = useCallback((title, message, onConfirm, theme = 'warning') => {
        if(window.triggerVibration) triggerVibration('warning');
        setDialog({ 
            isOpen: true, type: 'confirm', title, message, theme, 
            onConfirm: () => { setDialog(prev => ({ ...prev, isOpen: false })); onConfirm(); }, 
            onCancel: () => setDialog(prev => ({ ...prev, isOpen: false })) 
        });
    }, []);

    return (
        <JarvisContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            {dialog.isOpen && <JarvisModalUI {...dialog} />}
        </JarvisContext.Provider>
    );
};

function JarvisModalUI({ type, title, message, theme, onConfirm, onCancel }) {
    // Thèmes visuels selon la situation
    const themes = {
        info: { border: 'border-blue-500/50', bg: 'bg-blue-900/10', text: 'text-blue-400', icon: Info },
        warning: { border: 'border-orange-500/50', bg: 'bg-orange-900/10', text: 'text-orange-400', icon: AlertTriangle },
        error: { border: 'border-red-500/50', bg: 'bg-red-900/10', text: 'text-red-500', icon: Skull },
        success: { border: 'border-green-500/50', bg: 'bg-green-900/10', text: 'text-green-400', icon: CheckCircle },
        jarvis: { border: 'border-gold/50', bg: 'bg-gold/5', text: 'text-gold', icon: Zap }
    };

    const currentTheme = themes[theme] || themes.info;
    const Icon = currentTheme.icon;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className={`bg-[#0a0a0a] border ${currentTheme.border} w-full max-w-sm rounded-xl p-6 shadow-2xl relative overflow-hidden`}>
                
                {/* Décoration d'arrière-plan */}
                <div className={`absolute top-0 right-0 p-4 opacity-5 ${currentTheme.text}`}>
                    <Icon className="w-24 h-24" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg ${currentTheme.bg} ${currentTheme.text} border ${currentTheme.border}`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <h3 className={`font-serif font-bold text-lg uppercase tracking-widest ${currentTheme.text}`}>
                            {title}
                        </h3>
                    </div>
                    
                    <p className="text-sm text-gray-300 leading-relaxed mb-8 whitespace-pre-line">
                        {message}
                    </p>

                    <div className="flex gap-3">
                        {type === 'confirm' && (
                            <button 
                                onClick={onCancel} 
                                className="flex-1 bg-transparent border border-white/10 text-gray-400 font-bold py-3 rounded-lg text-xs uppercase tracking-widest hover:bg-white/5 transition-colors"
                            >
                                Annuler
                            </button>
                        )}
                        <button 
                            onClick={onConfirm} 
                            className={`flex-1 font-bold py-3 rounded-lg text-xs uppercase tracking-widest transition-colors ${
                                theme === 'error' || theme === 'warning' 
                                ? 'bg-red-600 text-white hover:bg-red-500' 
                                : theme === 'success' ? 'bg-green-600 text-white hover:bg-green-500'
                                : 'bg-gold text-black hover:bg-yellow-400'
                            }`}
                        >
                            {type === 'confirm' ? 'Confirmer' : 'Reçu'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
