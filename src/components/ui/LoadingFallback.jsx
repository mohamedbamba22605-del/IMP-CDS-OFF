import React from 'react';
import { Loader2 } from './Icons';

function LoadingFallback() {
    return (
        <div className="h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-gold animate-spin mb-4" />
            <p className="text-sm text-gray-500 uppercase tracking-widest">Chargement...</p>
        </div>
    );
}

export default LoadingFallback;
