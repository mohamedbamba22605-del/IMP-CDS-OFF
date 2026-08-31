import React from 'react';
import { Fingerprint } from './Icons';

function SplashScreen({ APP_VERSION }) {
    return (
        <div className="fixed inset-0 bg-[#050505] z-[100] flex flex-col items-center justify-center animate-out fade-out duration-1000 fill-mode-forwards delay-[2500ms]">
            <div className="relative mb-8"><div className="absolute inset-0 bg-gold/20 blur-xl rounded-full animate-pulse"></div><Fingerprint className="w-20 h-20 text-gold relative z-10 animate-bounce-slow" /></div>
            <h1 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-700 via-gold to-yellow-700 tracking-[0.3em] mb-6 animate-pulse">IMPERIUM</h1>
            <div className="w-48 h-1 bg-gray-900 rounded-full overflow-hidden"><div className="h-full bg-gold animate-loading-bar rounded-full"></div></div>
            <p className="absolute bottom-10 text-[10px] text-gray-600 uppercase tracking-widest font-mono">Système Sécurisé v{APP_VERSION}</p>
            <style>{`@keyframes loading-bar { 0% { width: 0%; } 50% { width: 70%; } 100% { width: 100%; } } .animate-loading-bar { animation: loading-bar 2.5s ease-in-out forwards; } .animate-bounce-slow { animation: bounce 3s infinite; }`}</style>
        </div>
    );
}

export default React.memo(SplashScreen);
