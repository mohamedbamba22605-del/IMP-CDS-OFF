import React from 'react';

function PageTransition({ children }) {
    return (<div className="animate-in slide-in-from-bottom-8 fade-in duration-500 w-full flex-1 flex flex-col overflow-hidden">{children}</div>);
}

export default React.memo(PageTransition);
