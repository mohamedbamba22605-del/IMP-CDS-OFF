import React from 'react';

// ==========================================
// COMPOSANT GRAPHIQUE SVG
// ==========================================
const PowerChart = React.memo(({ data, color = "#D4AF37" }) => {
    if (!data || data.length < 2) return <div className="h-32 flex items-center justify-center text-gray-600 text-xs">Données insuffisantes</div>;
    const height = 100;
    const width = 300;
    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);
    const range = maxVal - minVal || 1; 
    const points = data.map((val, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((val - minVal) / range) * height * 0.8 - 10; 
        return `${x},${y}`;
    }).join(' ');
    const fillPoints = `${points} ${width},${height} 0,${height}`;
    return (
        <div className="w-full h-32 relative overflow-hidden rounded-lg bg-[#0a0a0a] border border-white/5">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full p-2">
                <defs><linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
                <polygon points={fillPoints} fill="url(#chartGradient)" />
                <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="absolute top-2 right-2 text-[9px] text-gray-500 font-mono bg-black/50 px-1 rounded">30 Jours</div>
        </div>
    );
});

export default PowerChart;
