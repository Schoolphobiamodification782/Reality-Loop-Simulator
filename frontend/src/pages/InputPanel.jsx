import React, { useState, useCallback, useEffect } from 'react';

/* ─────────────────────────────────────────────
   CARD DEFINITIONS
   Each card is one full-screen moment
───────────────────────────────────────────── */
const CARDS = [
  {
    id: 'welcome',
    section: null,
    type: 'intro',
    title: 'Vitals',
    subtitle: 'How does your body live?',
    color: '#ff2a2a',
    bg: 'rgba(255,42,42,0.04)',
  },
  {
    id: 'sleep',
    section: 'VITALS',
    type: 'slider',
    key: 'sleep_hours',
    question: 'How many hours do you sleep?',
    hint: 'Science says 7–9 hrs is optimal for cellular repair and memory formation.',
    min: 2, max: 12, step: 0.5,
    unit: ' hours/night',
    optimal: 8,
    color: '#7c6cff',
    bg: 'rgba(124,108,255,0.05)',
    icon: '🌙',
  },
  {
    id: 'diet',
    section: 'VITALS',
    type: 'duo',
    keys: ['diet_quality', 'junk_food_frequency'],
    labels: ['Diet Quality', 'Junk Food Frequency'],
    hints: ['How clean and nutritious is your daily diet?', 'How often do you eat processed or fast food?'],
    mins: [1, 0], maxs: [10, 10], steps: [1, 1],
    units: ['/10', '/10'],
    optimals: [8, 1],
    color: '#39ff14',
    bg: 'rgba(57,255,20,0.04)',
    icon: '🥗',
  },
  {
    id: 'body',
    section: 'VITALS',
    type: 'duo-toggle',
    toggleKeys: ['gym'],
    toggleLabels: ['Regular Exercise (3+ times/week)'],
    sliderKey: 'outdoor_time',
    sliderLabel: 'Outdoor / Walking Time',
    sliderMin: 0, sliderMax: 40, sliderStep: 1,
    sliderUnit: ' hrs/week',
    sliderOptimal: 14,
    color: '#00f3ff',
    bg: 'rgba(0,243,255,0.04)',
    icon: '🏃',
  },
  {
    id: 'psych_intro',
    section: null,
    type: 'intro',
    title: 'Psychology',
    subtitle: 'How does your mind really feel?',
    color: '#ff6b35',
    bg: 'rgba(255,107,53,0.04)',
  },
  {
    id: 'screen',
    section: 'PSYCH',
    type: 'slider',
    key: 'screen_time',
    question: 'Hours of screen time per day (not work)?',
    hint: 'Every hour beyond 2 systematically degrades your dopamine receptors.',
    min: 0, max: 16, step: 0.5,
    unit: ' hours/day',
    optimal: 2,
    color: '#ff6b35',
    bg: 'rgba(255,107,53,0.05)',
    icon: '📱',
  },
  {
    id: 'stress',
    section: 'PSYCH',
    type: 'duo',
    keys: ['stress_level', 'substance_use'],
    labels: ['Daily Stress Level', 'Substance Use'],
    hints: ['1 = fully calm, 10 = constantly overwhelmed', 'Alcohol, nicotine, vaping, recreational drugs'],
    mins: [1, 0], maxs: [10, 10], steps: [1, 1],
    units: ['/10', '/10'],
    optimals: [3, 0],
    color: '#ff2a2a',
    bg: 'rgba(255,42,42,0.05)',
    icon: '⚡',
  },
  {
    id: 'mind',
    section: 'PSYCH',
    type: 'duo-toggle',
    toggleKeys: ['meditates'],
    toggleLabels: ['Daily Meditation or Mindfulness'],
    sliderKey: 'reading_hours',
    sliderLabel: 'Reading Time / Week',
    sliderMin: 0, sliderMax: 21, sliderStep: 0.5,
    sliderUnit: ' hrs/week',
    sliderOptimal: 7,
    color: '#c77dff',
    bg: 'rgba(199,125,255,0.04)',
    icon: '🧠',
  },
  {
    id: 'grind_intro',
    section: null,
    type: 'intro',
    title: 'The Grind',
    subtitle: 'What does your hustle cost you?',
    color: '#ffff00',
    bg: 'rgba(255,255,0,0.03)',
  },
  {
    id: 'work',
    section: 'GRIND',
    type: 'slider',
    key: 'work_hours',
    question: 'How many hours do you work per day?',
    hint: '8 hrs is the baseline. Every extra hour without recovery multiplies burnout risk.',
    min: 0, max: 16, step: 0.5,
    unit: ' hours/day',
    optimal: 8,
    color: '#ffff00',
    bg: 'rgba(255,255,0,0.04)',
    icon: '💼',
  },
  {
    id: 'social_finance',
    section: 'GRIND',
    type: 'duo',
    keys: ['social_hours', 'financial_discipline'],
    labels: ['Social Time / Week', 'Financial Discipline'],
    hints: ['Real, in-person time with others', 'Budgeting, saving, investing consistency'],
    mins: [0, 1], maxs: [40, 10], steps: [1, 1],
    units: [' hrs', '/10'],
    optimals: [15, 9],
    color: '#39ff14',
    bg: 'rgba(57,255,20,0.04)',
    icon: '💰',
  },
  {
    id: 'income',
    section: 'GRIND',
    type: 'income',
    question: 'What is your annual income?',
    hint: 'This anchors the 5-year financial trajectory calculation.',
    color: '#7c6cff',
    bg: 'rgba(124,108,255,0.04)',
    icon: '💵',
  },
];

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const DEFAULT_INPUTS = {
  sleep_hours: 7, wake_up_time: 7, diet_quality: 5, junk_food_frequency: 3,
  gym: false, outdoor_time: 5, screen_time: 4, stress_level: 5,
  substance_use: 2, meditates: false, reading_hours: 2,
  work_hours: 8, income: 50000, social_hours: 5, financial_discipline: 5,
};

function diffColor(value, optimal, min, max) {
  const range = max - min;
  const diff = Math.abs(value - optimal) / range;
  if (diff < 0.15) return '#39ff14';
  if (diff < 0.35) return '#ffff00';
  return '#ff2a2a';
}

function SliderWidget({ name, label, hint, min, max, step, value, unit, optimal, color, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;
  const col = diffColor(value, optimal, min, max);
  return (
    <div className="w-full space-y-4">
      {hint && <p className="font-mono text-sm text-center opacity-50 uppercase tracking-wider max-w-md mx-auto leading-relaxed">{hint}</p>}
      <div
        className="text-6xl md:text-8xl font-mono font-bold text-center transition-colors duration-300"
        style={{ color: col, textShadow: `0 0 30px ${col}60` }}
      >
        {value}{unit}
      </div>
      <div className="relative px-4">
        <input
          type="range"
          name={name}
          min={min} max={max} step={step}
          value={value}
          onChange={onChange}
          style={{
            width: '100%',
            display: 'block',
            background: `linear-gradient(to right, ${col} ${pct}%, rgba(31,40,51,0.8) ${pct}%)`,
          }}
        />
      </div>
      <div className="flex justify-between font-mono text-xs text-cyberGray px-4">
        <span>{min}{unit}</span>
        <span className="text-neonGreen">Optimal: {optimal}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

function ToggleWidget({ name, label, value, onToggle, color }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full py-6 px-8 border-2 font-mono font-bold text-xl uppercase tracking-widest transition-all duration-400 flex items-center justify-between"
      style={{
        borderColor: value ? color : 'rgba(31,40,51,0.8)',
        background: value ? `${color}18` : 'transparent',
        color: value ? color : '#C5C6C7',
        boxShadow: value ? `0 0 30px ${color}30` : 'none',
      }}
    >
      <span>{label}</span>
      <span className="text-3xl">{value ? '✓' : '○'}</span>
    </button>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const InputPanel = ({ onSimulate, shockMode }) => {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [cardIdx, setCardIdx] = useState(0);
  const [animState, setAnimState] = useState('in'); // 'in' | 'out-back' | 'out-forward'

  const card = CARDS[cardIdx];
  const progress = cardIdx / (CARDS.length - 1);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: Number(value) }));
  }, []);

  const toggle = useCallback((key) => {
    setInputs(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const navigate = useCallback((direction) => {
    const outAnim = direction === 1 ? 'out-back' : 'out-forward';
    setAnimState(outAnim);
    setTimeout(() => {
      setCardIdx(i => i + direction);
      setAnimState('in');
    }, 380);
  }, []);

  const isLast = cardIdx === CARDS.length - 1;

  /* ── CSS animation classes per state ── */
  const animCSS = {
    'in':           'dream-card-in',
    'out-back':     'dream-card-out-back',
    'out-forward':  'dream-card-out-forward',
  }[animState];

  const renderCardContent = () => {
    if (card.type === 'intro') {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
          <div className="text-7xl md:text-9xl font-mono font-bold uppercase"
               style={{ color: card.color, textShadow: `0 0 60px ${card.color}50` }}>
            {card.title}
          </div>
          <div className="text-xl md:text-2xl font-mono text-cyberGray uppercase tracking-widest">
            {card.subtitle}
          </div>
          <button
            onClick={() => navigate(1)}
            className="mt-8 px-12 py-4 font-mono font-bold text-lg uppercase tracking-widest border-2 transition-all duration-300"
            style={{ borderColor: card.color, color: card.color }}
            onMouseEnter={e => { e.currentTarget.style.background = card.color; e.currentTarget.style.color = '#040506'; e.currentTarget.style.boxShadow = `0 0 30px ${card.color}60`; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = card.color; e.currentTarget.style.boxShadow = 'none'; }}
          >
            [ Continue ]
          </button>
        </div>
      );
    }

    if (card.type === 'slider') {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-10 px-4">
          <div className="text-5xl mb-2">{card.icon}</div>
          <h2 className="text-2xl md:text-3xl font-mono font-bold text-white uppercase tracking-wider max-w-md">
            {card.question}
          </h2>
          <SliderWidget
            name={card.key}
            hint={card.hint}
            min={card.min} max={card.max} step={card.step}
            value={inputs[card.key]}
            unit={card.unit}
            optimal={card.optimal}
            color={card.color}
            onChange={handleChange}
          />
        </div>
      );
    }

    if (card.type === 'duo') {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-10 px-4">
          <div className="text-5xl">{card.icon}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
            {card.keys.map((key, i) => {
              const pct = ((inputs[key] - card.mins[i]) / (card.maxs[i] - card.mins[i])) * 100;
              const col = diffColor(inputs[key], card.optimals[i], card.mins[i], card.maxs[i]);
              return (
                <div key={key} className="space-y-3 bg-[#0B0C10]/60 p-6 border border-[#1F2833]/60">
                  <p className="font-mono text-xs uppercase tracking-widest text-cyberGray">{card.labels[i]}</p>
                  <p className="font-mono text-xs text-cyberGray/60">{card.hints[i]}</p>
                  <div className="text-4xl font-mono font-bold" style={{ color: col, textShadow: `0 0 15px ${col}60` }}>
                    {inputs[key]}{card.units[i]}
                  </div>
                  <input
                    type="range"
                    name={key}
                    min={card.mins[i]} max={card.maxs[i]} step={card.steps[i]}
                    value={inputs[key]}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      background: `linear-gradient(to right, ${col} ${pct}%, rgba(31,40,51,0.8) ${pct}%)`,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (card.type === 'duo-toggle') {
      const pct = ((inputs[card.sliderKey] - card.sliderMin) / (card.sliderMax - card.sliderMin)) * 100;
      const col = diffColor(inputs[card.sliderKey], card.sliderOptimal, card.sliderMin, card.sliderMax);
      return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8 px-4 max-w-xl mx-auto w-full">
          <div className="text-5xl">{card.icon}</div>
          {card.toggleKeys.map((key, i) => (
            <ToggleWidget
              key={key}
              name={key}
              label={card.toggleLabels[i]}
              value={inputs[key]}
              onToggle={() => toggle(key)}
              color={card.color}
            />
          ))}
          <div className="w-full space-y-3 bg-[#0B0C10]/60 p-6 border border-[#1F2833]/60">
            <p className="font-mono text-xs uppercase tracking-widest text-cyberGray">{card.sliderLabel}</p>
            <div className="text-4xl font-mono font-bold" style={{ color: col }}>
              {inputs[card.sliderKey]}{card.sliderUnit}
            </div>
            <input
              type="range"
              name={card.sliderKey}
              min={card.sliderMin} max={card.sliderMax} step={card.sliderStep}
              value={inputs[card.sliderKey]}
              onChange={handleChange}
              style={{
                width: '100%',
                background: `linear-gradient(to right, ${col} ${pct}%, rgba(31,40,51,0.8) ${pct}%)`,
              }}
            />
          </div>
        </div>
      );
    }

    if (card.type === 'income') {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-10 px-4">
          <div className="text-5xl">{card.icon}</div>
          <h2 className="text-2xl md:text-3xl font-mono font-bold text-white uppercase tracking-wider max-w-md">
            {card.question}
          </h2>
          <p className="font-mono text-sm text-cyberGray/60 uppercase tracking-wider max-w-sm">{card.hint}</p>
          <div className="relative w-full max-w-sm">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 font-mono text-3xl text-cyberGray">$</span>
            <input
              type="number"
              name="income"
              value={inputs.income}
              onChange={e => setInputs(p => ({ ...p, income: Number(e.target.value) }))}
              className="w-full bg-[#0B0C10] border-2 border-[#1F2833] text-white font-mono text-3xl pl-12 pr-6 py-6 focus:outline-none text-center"
              style={{ borderColor: card.color, boxShadow: `0 0 20px ${card.color}20` }}
            />
          </div>
          {/* Final submit */}
          <button
            onClick={() => onSimulate(inputs)}
            className="mt-4 px-16 py-6 font-mono font-bold text-2xl uppercase tracking-widest transition-all duration-300"
            style={{ background: card.color, color: '#040506', boxShadow: `0 0 40px ${card.color}60` }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 60px ${card.color}80`; e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 40px ${card.color}60`; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            [ RUN DEEP SIMULATION ]
          </button>
        </div>
      );
    }
  };

  return (
    <div
      className="relative w-full min-h-screen flex flex-col overflow-hidden"
      style={{ perspective: '1200px', perspectiveOrigin: '50% 40%' }}
    >
      {/* Ambient background glow that shifts per card */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${card.color}08 0%, transparent 70%)`,
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `linear-gradient(${card.color}10 1px, transparent 1px), linear-gradient(90deg, ${card.color}10 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Progress bar */}
      <div className="absolute top-0 left-0 w-full h-0.5 z-20">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progress * 100}%`, background: card.color, boxShadow: `0 0 8px ${card.color}` }}
        />
      </div>

      {/* Card counter */}
      <div className="absolute top-6 left-6 z-20 font-mono text-xs text-cyberGray uppercase tracking-widest">
        {card.section ? `${card.section}` : ''}
      </div>
      <div className="absolute top-6 right-20 z-20 font-mono text-xs text-cyberGray uppercase tracking-widest">
        {cardIdx + 1} / {CARDS.length}
      </div>

      {/* THE CARD */}
      <div
        key={cardIdx}
        className={`flex-1 flex flex-col items-center justify-center w-full min-h-screen ${animCSS}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="w-full max-w-3xl px-6 py-20">
          {renderCardContent()}
        </div>
      </div>

      {/* Navigation arrows (only for non-intro, non-income cards) */}
      {card.type !== 'intro' && card.type !== 'income' && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 z-20">
          {cardIdx > 0 && (
            <button
              onClick={() => navigate(-1)}
              className="font-mono text-cyberGray hover:text-white text-sm uppercase tracking-widest transition-colors px-6 py-3 border border-cyberGray/30 hover:border-white/50"
            >
              ← Back
            </button>
          )}
          <button
            onClick={() => navigate(1)}
            className="font-mono font-bold text-sm uppercase tracking-widest px-10 py-3 border-2 transition-all duration-300"
            style={{ borderColor: card.color, color: card.color }}
            onMouseEnter={e => { e.currentTarget.style.background = card.color; e.currentTarget.style.color = '#040506'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = card.color; }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default InputPanel;
