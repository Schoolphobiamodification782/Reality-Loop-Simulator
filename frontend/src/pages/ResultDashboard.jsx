import React, { useEffect, useState, useRef } from 'react';
import {
  Chart as ChartJS, RadialLinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import Recommendations from '../components/Recommendations';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

/* ═══════════════════════════════════════════
   UTILS
═══════════════════════════════════════════ */
function scoreColor(v) {
  if (v >= 70) return '#39ff14';
  if (v >= 40) return '#ffff00';
  return '#ff2a2a';
}
function levelColor(l) {
  if (l === 'LOW' || l === 'STABLE') return '#39ff14';
  if (l === 'HIGH') return '#ffff00';
  return '#ff2a2a';
}

/* Animated counter hook */
function useCounter(target, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(target * ease));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

/* ═══════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════ */

/* Arc ring for life score */
function ScoreRing({ score }) {
  const r = 80;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = scoreColor(score);
  const animScore = useCounter(score);

  return (
    <div className="relative w-52 h-52 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        {/* Track */}
        <circle cx="100" cy="100" r={r} fill="none" stroke="#1F2833" strokeWidth="10" />
        {/* Fill */}
        <circle
          cx="100" cy="100" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="butt"
          style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dashoffset 1.8s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-bold text-5xl" style={{ color }}>{animScore}</span>
        <span className="font-mono text-xs text-cyberGray uppercase tracking-widest">/100</span>
      </div>
    </div>
  );
}

/* Animated stat card */
function StatCard({ label, value, sub, colorStr, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div
      className="metric-card p-5 flex flex-col gap-2 transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}
    >
      <span className="font-mono text-xs uppercase tracking-widest text-cyberGray">{label}</span>
      <span className="font-mono font-bold text-2xl md:text-3xl" style={{ color: colorStr }}>{value}</span>
      {sub && <span className="font-mono text-xs text-cyberGray/60 uppercase tracking-wide">{sub}</span>}
    </div>
  );
}

/* Glowing bar */
function GlowBar({ label, value, delay = 0 }) {
  const [w, setW] = useState(0);
  const color = scoreColor(value);
  useEffect(() => { const t = setTimeout(() => setW(value), delay + 200); return () => clearTimeout(t); }, [value, delay]);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between font-mono text-xs uppercase tracking-widest">
        <span className="text-cyberGray">{label}</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <div className="h-1 bg-[#1F2833]">
        <div style={{ width: `${w}%`, height: '100%', background: color, boxShadow: `0 0 8px ${color}80`, transition: 'width 1.4s cubic-bezier(0.16,1,0.3,1)' }} />
      </div>
    </div>
  );
}

/* Message row */
function MessageRow({ msg, idx, shockMode }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), idx * 180 + 300); return () => clearTimeout(t); }, [idx]);
  return (
    <div
      className="flex items-start gap-4 py-4 border-b border-[#1F2833]/60 transition-all duration-600"
      style={{ opacity: show ? 1 : 0, transform: show ? 'translateX(0)' : 'translateX(-24px)' }}
    >
      <span className="font-mono text-neonRed flex-shrink-0 mt-0.5 text-lg">&gt;</span>
      <p className={`font-mono text-sm md:text-base uppercase font-bold leading-relaxed ${shockMode ? 'text-neonRed' : 'text-neonYellow'}`}>{msg}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════ */
const ResultDashboard = ({ result, shockMode, isFixed, onFixHabits, onRestart }) => {
  if (!result) return null;

  const {
    life_score = 0, income_5y = 0, income_growth = 0,
    burnout_level = 'N/A', mental_state_score = 'N/A',
    time_wasted_hours = 0, wasted_days = 0, messages = [],
    biological_age_modifier = 0, dopamine_baseline = 0,
    relationship_health = 0, cognitive_decline_risk = 'N/A',
    nutrition_score = 0, burnout_index = 0,
    radar_stats = { Sanity: 50, Wealth: 50, Health: 50, Relationships: 50, Cognition: 50 },
  } = result;

  const animHours = useCounter(time_wasted_hours, 2200);
  const animDays  = useCounter(wasted_days, 2200);

  const accent = shockMode ? '#ff2a2a' : '#39ff14';

  const radarData = {
    labels: ['Sanity', 'Wealth', 'Health', 'Relations', 'Cognition'],
    datasets: [{
      label: 'Life Matrix',
      data: [radar_stats.Sanity, radar_stats.Wealth, radar_stats.Health, radar_stats.Relationships, radar_stats.Cognition],
      backgroundColor: `${accent}14`,
      borderColor: accent,
      borderWidth: 2,
      pointBackgroundColor: accent,
      pointRadius: 5,
    }],
  };

  const radarOptions = {
    responsive: true, maintainAspectRatio: false,
    scales: {
      r: {
        min: 0, max: 100,
        angleLines: { color: 'rgba(31,40,51,0.6)' },
        grid: { color: 'rgba(31,40,51,0.6)' },
        pointLabels: { color: '#C5C6C7', font: { family: "'Space Mono'", size: 11 } },
        ticks: { display: false },
      },
    },
    plugins: { legend: { display: false } },
  };

  const isHealthy = life_score >= 70;

  return (
    <div className="flex-1 w-full overflow-y-auto fade-in">

      {/* ─── HERO SECTION ─── */}
      <div
        className="relative w-full min-h-screen flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden"
        style={{ background: `radial-gradient(ellipse at 50% 40%, ${scoreColor(life_score)}08 0%, transparent 65%)` }}
      >
        {/* Animated grid lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20"
             style={{
               backgroundImage: `linear-gradient(${scoreColor(life_score)}15 1px, transparent 1px), linear-gradient(90deg, ${scoreColor(life_score)}15 1px, transparent 1px)`,
               backgroundSize: '60px 60px',
             }} />

        {/* Section tag */}
        <p className="font-mono text-xs uppercase tracking-widest text-neonRed animate-pulse mb-6">
          ◈ SIMULATION COMPLETE ◈
        </p>

        {/* BIG TITLE */}
        <h1
          className={`text-5xl md:text-7xl lg:text-8xl font-mono font-bold uppercase mb-4 leading-none ${shockMode ? 'glitch text-neonRed' : 'text-white'}`}
          data-text={shockMode ? 'YOUR INEVITABLE DESTINY' : 'THIS IS YOUR LIFE IN 5 YEARS'}
        >
          {shockMode ? 'YOUR INEVITABLE DESTINY' : 'THIS IS YOUR LIFE IN 5 YEARS'}
        </h1>

        {isFixed && (
          <p className="font-mono text-sm text-neonGreen uppercase tracking-widest mb-4 animate-pulse">
            &gt; OPTIMIZED TIMELINE PROJECTED &lt;
          </p>
        )}

        {/* Score Ring */}
        <div className="my-10">
          <p className="font-mono text-xs text-cyberGray uppercase tracking-widest mb-4">Overall Life Score</p>
          <ScoreRing score={life_score} />
          <p className="font-mono text-sm uppercase tracking-widest mt-4" style={{ color: scoreColor(life_score) }}>
            {life_score >= 70 ? 'Trajectory: Sustainable' : life_score >= 40 ? 'Trajectory: At Risk' : 'Trajectory: Collapse Incoming'}
          </p>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="font-mono text-xs text-cyberGray uppercase tracking-widest">Scroll to see full report</span>
          <span className="text-neonRed text-xl">↓</span>
        </div>
      </div>

      {/* ─── BODY ─── */}
      <div className="max-w-6xl mx-auto px-4 pb-24 space-y-16">

        {/* ── VITAL STATS GRID ── */}
        <section>
          <SectionLabel>Primary Outputs</SectionLabel>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="5-Year Income"    value={`$${(income_5y/1000).toFixed(0)}k`}
              colorStr={scoreColor(income_growth >= 0 ? 80 : 20)} delay={0} />
            <StatCard label="Income Growth"    value={`${income_growth >= 0 ? '+' : ''}${income_growth}%`}
              colorStr={income_growth >= 0 ? '#39ff14' : '#ff2a2a'} delay={100} />
            <StatCard label="Burnout Risk"     value={burnout_level}
              colorStr={levelColor(burnout_level)} delay={200} />
            <StatCard label="Mental State"     value={mental_state_score}
              colorStr={levelColor(mental_state_score)} delay={300} />
            <StatCard label="Cognitive Risk"   value={cognitive_decline_risk}
              colorStr={levelColor(cognitive_decline_risk)} delay={400} />
            <StatCard label="Bio Age Shift"    value={`${biological_age_modifier > 0 ? '+' : ''}${biological_age_modifier}y`}
              sub="years accelerated"
              colorStr={biological_age_modifier > 5 ? '#ff2a2a' : biological_age_modifier > 2 ? '#ffff00' : '#39ff14'} delay={500} />
            <StatCard label="Nutrition"        value={`${nutrition_score}%`}
              colorStr={scoreColor(nutrition_score)} delay={600} />
            <StatCard label="Burnout Index"    value={burnout_index.toFixed(1)}
              sub="higher = worse (max ~22)"
              colorStr={burnout_index >= 6 ? '#ff2a2a' : burnout_index >= 3.5 ? '#ffff00' : '#39ff14'} delay={700} />
          </div>
        </section>

        {/* ── ATTRIBUTE MATRIX ── */}
        <section>
          <SectionLabel>Attribute Matrix</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Radar */}
            <div className="bg-[#040506] border border-[#1F2833] p-6 relative" style={{ minHeight: 380 }}>
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neonRed/40 to-transparent" />
              <p className="font-mono text-xs uppercase tracking-widest text-cyberGray mb-4 text-center">Life Stats</p>
              <div style={{ height: 300 }}>
                <Radar data={radarData} options={radarOptions} />
              </div>
            </div>

            {/* Subsystem bars */}
            <div className="bg-[#040506] border border-[#1F2833] p-6 flex flex-col justify-center space-y-5">
              <p className="font-mono text-xs uppercase tracking-widest text-cyberGray text-center mb-2">Subsystem Integrity</p>
              <GlowBar label="Dopamine Baseline"    value={dopamine_baseline}           delay={0} />
              <GlowBar label="Sanity Index"          value={radar_stats.Sanity}          delay={100} />
              <GlowBar label="Physical Health"       value={radar_stats.Health}          delay={200} />
              <GlowBar label="Cognition"             value={radar_stats.Cognition}       delay={300} />
              <GlowBar label="Social Bonds"          value={radar_stats.Relationships}   delay={400} />
              <GlowBar label="Financial Trajectory"  value={radar_stats.Wealth}          delay={500} />
            </div>
          </div>
        </section>

        {/* ── DAMAGE REPORT ── */}
        <section>
          <SectionLabel>Damage Report</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Dopamine */}
            <div className="bg-[#0B0C10] border border-[#1F2833] p-6 text-center relative overflow-hidden group hover:border-neonRed/40 transition-all">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                   style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,42,42,0.04), transparent)' }} />
              <p className="font-mono text-xs uppercase tracking-widest text-cyberGray mb-3">Dopamine Receptor</p>
              <div className="text-5xl font-mono font-bold mb-1" style={{ color: scoreColor(dopamine_baseline), textShadow: `0 0 20px ${scoreColor(dopamine_baseline)}60` }}>
                {dopamine_baseline}%
              </div>
              <p className="font-mono text-xs text-cyberGray">{dopamine_baseline < 50 ? 'Receptors compromised' : 'Baseline intact'}</p>
            </div>

            {/* Bio Age */}
            <div className="bg-[#0B0C10] border border-[#1F2833] p-6 text-center relative overflow-hidden group hover:border-neonYellow/40 transition-all">
              <p className="font-mono text-xs uppercase tracking-widest text-cyberGray mb-3">Biological Age Shift</p>
              <div className="text-5xl font-mono font-bold mb-1"
                   style={{ color: biological_age_modifier > 3 ? '#ff2a2a' : '#39ff14', textShadow: biological_age_modifier > 3 ? '0 0 20px rgba(255,42,42,0.5)' : 'none' }}>
                {biological_age_modifier > 0 ? '+' : ''}{biological_age_modifier}<span className="text-2xl">y</span>
              </div>
              <p className="font-mono text-xs text-cyberGray">{biological_age_modifier > 5 ? 'Accelerated aging' : biological_age_modifier > 2 ? 'Slight acceleration' : 'Aging normally'}</p>
            </div>

            {/* Relationships */}
            <div className="bg-[#0B0C10] border border-[#1F2833] p-6 text-center group hover:border-neonGreen/40 transition-all">
              <p className="font-mono text-xs uppercase tracking-widest text-cyberGray mb-3">Relationship Health</p>
              <div className="text-5xl font-mono font-bold mb-1" style={{ color: scoreColor(relationship_health) }}>
                {relationship_health}%
              </div>
              <p className="font-mono text-xs text-cyberGray">{relationship_health < 35 ? 'Isolation risk: high' : relationship_health < 60 ? 'Social bonds: fragile' : 'Social bonds: healthy'}</p>
            </div>
          </div>
        </section>

        {/* ── TIME HEMORRHAGE ── */}
        <section>
          <div
            className="relative overflow-hidden text-center px-8 py-16"
            style={{
              border: '2px solid rgba(255,42,42,0.6)',
              background: 'rgba(255,42,42,0.03)',
              boxShadow: '0 0 60px rgba(255,42,42,0.08), inset 0 0 60px rgba(255,42,42,0.03)',
            }}
          >
            {/* Corner glows */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-neonRed" />
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-neonRed" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-neonRed" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-neonRed" />

            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#040506] px-6 py-1">
              <span className="font-mono text-neonRed text-xs uppercase tracking-[0.3em]">⬛ Time Hemorrhage Analysis ⬛</span>
            </div>

            <p className="font-mono text-cyberGray uppercase tracking-widest text-sm mb-2">Meaningless screen hours over 5 years</p>

            <div
              className="text-8xl md:text-[140px] font-mono font-black tabular-nums leading-none"
              style={{ color: '#ff2a2a', textShadow: '0 0 60px rgba(255,42,42,0.5), 0 0 120px rgba(255,42,42,0.2)' }}
            >
              {animHours.toLocaleString()}
            </div>
            <p className="font-mono text-2xl text-cyberGray mt-1 mb-6 uppercase tracking-widest">hours</p>

            <div className="h-px w-48 mx-auto mb-6" style={{ background: 'linear-gradient(90deg, transparent, #ff2a2a, transparent)' }} />

            <p className="font-mono text-xl md:text-2xl text-white">
              = <span className="font-bold text-neonRed" style={{ textShadow: '0 0 20px rgba(255,42,42,0.5)' }}>{animDays}</span>
              <span className="text-cyberGray"> days of your continuous existence</span>
            </p>
          </div>
        </section>

        {/* ── SYSTEM ANALYSIS ── */}
        <section>
          <SectionLabel>System Analysis</SectionLabel>
          <div className="bg-[#0B0C10] border border-[#1F2833] px-8 py-6">
            {messages.map((m, i) => <MessageRow key={i} msg={m} idx={i} shockMode={shockMode} />)}

            {!isFixed && (
              <div className="mt-8 pt-6 text-center space-y-2 border-t border-[#1F2833]">
                <p className="font-mono text-white text-xl md:text-2xl">
                  {shockMode ? 'The collapse is already in motion.' : 'If nothing changes, this is your life.'}
                </p>
                <p className="font-mono font-bold text-xl md:text-2xl uppercase tracking-widest" style={{ color: '#39ff14', textShadow: '0 0 15px rgba(57,255,20,0.4)' }}>
                  {shockMode ? 'There is a narrow window for intervention.' : 'You still have time to fix it.'}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── RECOMMENDATIONS ── */}
        <section>
          <SectionLabel>Personalized Media — Based on Your Results</SectionLabel>
          <Recommendations result={result} shockMode={shockMode} />
        </section>

        {/* ── ACTION BUTTONS ── */}
        <section className="flex flex-col md:flex-row gap-5 justify-center pt-4">
          {!isFixed && (
            <button
              onClick={onFixHabits}
              className="px-10 py-5 font-mono font-bold text-xl uppercase tracking-widest transition-all duration-300 relative overflow-hidden"
              style={{ background: '#39ff14', color: '#040506', boxShadow: '0 0 30px rgba(57,255,20,0.4)' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 60px rgba(57,255,20,0.7)'; e.currentTarget.style.transform = 'scale(1.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(57,255,20,0.4)'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              [ WHAT IF I FIX MY HABITS? ]
            </button>
          )}
          <button
            onClick={onRestart}
            className="px-10 py-5 font-mono font-bold text-xl uppercase tracking-widest border-2 transition-all duration-300"
            style={{ borderColor: '#1F2833', color: '#C5C6C7' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = '0 0 20px rgba(255,255,255,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1F2833'; e.currentTarget.style.color = '#C5C6C7'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            [ REBOOT SYSTEM ]
          </button>
        </section>

      </div>
    </div>
  );
};

/* Section header helper */
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1 h-px bg-gradient-to-r from-neonRed/50 to-transparent" />
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-cyberGray px-2">{children}</span>
      <div className="flex-1 h-px bg-gradient-to-l from-neonRed/50 to-transparent" />
    </div>
  );
}

export default ResultDashboard;
