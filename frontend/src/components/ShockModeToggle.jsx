import React from 'react';

const ShockModeToggle = ({ shockMode, setShockMode }) => {
  return (
    <div
      className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-2"
      style={{
        background: 'rgba(11,12,16,0.9)',
        border: '1px solid rgba(255,42,42,0.3)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <span className={`font-mono text-xs uppercase tracking-widest font-bold transition-colors ${shockMode ? 'text-neonRed' : 'text-cyberGray'}`}>
        Shock Mode
      </span>
      <button
        onClick={() => setShockMode(!shockMode)}
        className="relative w-12 h-6 flex items-center p-0.5 transition-all duration-300 focus:outline-none"
        style={{
          background: shockMode ? '#ff2a2a' : '#1F2833',
          boxShadow: shockMode ? '0 0 12px rgba(255,42,42,0.6)' : 'none',
        }}
      >
        <div
          className="w-5 h-5 bg-white transition-transform duration-300 flex-shrink-0"
          style={{ transform: shockMode ? 'translateX(24px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
};

export default ShockModeToggle;
