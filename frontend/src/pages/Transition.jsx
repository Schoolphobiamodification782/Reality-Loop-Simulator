import React, { useState, useEffect } from 'react';

const MESSAGES = [
  "Synchronizing behavioral patterns...",
  "Mapping neural pathway degradation...",
  "Projecting 5-year income trajectory...",
  "Calculating biological age offset...",
  "Analyzing dopamine receptor baseline...",
  "Detecting systemic risk factors...",
  "Compiling life outcome matrix...",
  "Simulation complete. Loading results...",
];

const SHOCK_MESSAGES = [
  "Compiling daily failures...",
  "Extrapolating physical decay rate...",
  "Calculating early deterioration index...",
  "Mapping cognitive erosion pattern...",
  "Documenting collateral damage...",
  "Projecting isolation trajectory...",
  "Finalizing your inescapable future...",
  "Your fate is sealed. Loading...",
];

const Transition = ({ shockMode }) => {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const messages = shockMode ? SHOCK_MESSAGES : MESSAGES;

  useEffect(() => {
    let idx = 0;
    const timer = setInterval(() => {
      idx++;
      if (idx < messages.length) {
        setActive(idx);
        setProgress(Math.round((idx / (messages.length - 1)) * 100));
      } else {
        clearInterval(timer);
      }
    }, 310);
    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-screen fade-in">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-neonRed font-mono text-sm uppercase tracking-widest mb-2 animate-pulse">
            ◈ DEEP SIMULATION RUNNING ◈
          </div>
          <div className="text-2xl text-white font-mono font-bold uppercase tracking-wide">
            Analyzing Your Trajectory
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-bar mb-8">
          <div
            className="progress-bar-fill bg-neonRed"
            style={{ width: `${progress}%`, boxShadow: '0 0 10px rgba(255,42,42,0.7)' }}
          />
        </div>

        {/* Messages list */}
        <div className="space-y-2 font-mono text-sm">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 transition-all duration-500 ${
                i < active ? 'text-cyberGray opacity-60' :
                i === active ? 'text-neonRed' :
                'text-cyberGray opacity-20'
              }`}
            >
              <span className={`text-xs ${i < active ? 'text-neonGreen' : i === active ? 'text-neonRed animate-pulse' : 'opacity-20'}`}>
                {i < active ? '✓' : i === active ? '►' : '·'}
              </span>
              <span className={i === active ? 'glow-text-red' : ''}>{msg}</span>
            </div>
          ))}
        </div>

        {/* Progress % */}
        <div className="mt-8 text-right font-mono text-3xl font-bold text-neonRed">
          {progress}<span className="text-lg text-cyberGray">%</span>
        </div>
      </div>
    </div>
  );
};

export default Transition;
