import React, { useEffect, useState } from 'react';

const TYPING_TEXTS = [
  "based on your current habits...",
  "based on your daily decisions...",
  "the algorithm doesn't lie...",
  "your patterns reveal everything...",
];

const SHOCK_TYPING_TEXTS = [
  "your collapse is already scheduled...",
  "the data doesn't lie...",
  "calculating behavioral failures...",
  "projecting your inevitable decline...",
];

const STATS = [
  { label: "LIVES SIMULATED", value: "2,847,392" },
  { label: "BURNOUT CASES", value: "91%" },
  { label: "AVERAGE WASTED", value: "14,600 hrs" },
];

const Hero = ({ onStart, shockMode }) => {
  const [displayText, setDisplayText] = useState('');
  const [textIdx, setTextIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const texts = shockMode ? SHOCK_TYPING_TEXTS : TYPING_TEXTS;

  useEffect(() => {
    const current = texts[textIdx];
    const delay = isDeleting ? 40 : 80;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(current.slice(0, charIdx + 1));
        if (charIdx + 1 === current.length) {
          setTimeout(() => setIsDeleting(true), 2000);
        } else {
          setCharIdx(c => c + 1);
        }
      } else {
        setDisplayText(current.slice(0, charIdx - 1));
        if (charIdx - 1 === 0) {
          setIsDeleting(false);
          setTextIdx(t => (t + 1) % texts.length);
          setCharIdx(0);
        } else {
          setCharIdx(c => c - 1);
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [charIdx, isDeleting, textIdx, texts]);

  const title = shockMode ? "YOUR DEMISE IS PREDICTABLE" : "YOUR FUTURE IS PREDICTABLE";

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-screen relative overflow-hidden fade-in">
      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-5 blur-3xl pointer-events-none"
           style={{ background: 'radial-gradient(circle, #ff2a2a, transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-5 blur-3xl pointer-events-none"
           style={{ background: 'radial-gradient(circle, #ff2a2a, transparent)' }} />

      {/* SYSTEM STATUS */}
      <div className="mb-12 flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-cyberGray">
        <span className="w-2 h-2 rounded-full bg-neonGreen animate-pulse inline-block" />
        SYSTEM ONLINE &nbsp;|&nbsp; ENGINE v2.0 &nbsp;|&nbsp; DEEP SIMULATION ACTIVE
      </div>

      {/* MAIN TITLE */}
      <h1
        className={`text-5xl md:text-7xl lg:text-8xl font-mono font-bold text-center uppercase mb-6 leading-none tracking-tight ${shockMode ? 'text-neonRed glitch glow-text-red' : 'text-white glitch'}`}
        data-text={title}
      >
        {title}
      </h1>

      {/* TYPING SUBTITLE */}
      <div className="text-lg md:text-2xl font-mono text-cyberGray mb-16 min-h-[2rem] text-center">
        <span className="text-neonRed">›</span>&nbsp;
        <span>{displayText}</span>
        <span className="animate-pulse">|</span>
      </div>

      {/* STATS ROW */}
      <div className="flex flex-wrap justify-center gap-8 mb-16">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-2xl md:text-3xl font-mono font-bold text-white">{s.value}</div>
            <div className="text-xs font-mono text-cyberGray uppercase tracking-widest mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* CTA BUTTON */}
      <button
        onClick={onStart}
        className="btn-neon-red px-12 py-5 text-lg md:text-xl tracking-widest"
        style={{ letterSpacing: '0.3em' }}
      >
        [ SIMULATE MY LIFE ]
      </button>

      <p className="mt-8 font-mono text-xs text-cyberGray opacity-40 uppercase tracking-widest">
        Warning: results may be psychologically uncomfortable.
      </p>
    </div>
  );
};

export default Hero;
