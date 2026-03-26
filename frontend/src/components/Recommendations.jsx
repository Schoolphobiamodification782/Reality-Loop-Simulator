import React from 'react';
import db from '../data/recommendations.json';

function getRecommendations(result) {
  const matches = [];
  for (const entry of db) {
    const { trigger } = entry;
    let matched = false;

    // burnout_level match
    if (trigger.burnout_level && trigger.burnout_level.includes(result.burnout_level)) matched = true;
    // dopamine below threshold
    if (!matched && trigger.dopamine_baseline?.below && result.dopamine_baseline < trigger.dopamine_baseline.below) matched = true;
    // relationship_health below threshold
    if (!matched && trigger.relationship_health?.below && result.relationship_health < trigger.relationship_health.below) matched = true;
    // cognitive_decline_risk match
    if (!matched && trigger.cognitive_decline_risk && trigger.cognitive_decline_risk.includes(result.cognitive_decline_risk)) matched = true;
    // life_score above
    if (!matched && trigger.life_score?.above && result.life_score > trigger.life_score.above) matched = true;
    // income_growth below (financial risk)
    if (!matched && trigger.income_growth?.below && (result.income_growth ?? 0) < trigger.income_growth.below) matched = true;

    if (matched) matches.push(entry);
    if (matches.length >= 2) break; // max 2 categories shown
  }
  return matches;
}

const Recommendations = ({ result, shockMode }) => {
  const recs = getRecommendations(result);
  if (!recs.length) return null;

  return (
    <div className="space-y-8">
      {recs.map((cat) => (
        <div key={cat.id} className="bg-[#0B0C10] border border-[#1F2833] p-6 relative">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neonRed/40 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Books */}
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-neonYellow mb-4">
                📚 Recommended Reading
              </p>
              <div className="space-y-3">
                {cat.books.slice(0, 3).map((b) => (
                  <div key={b.title} className="flex flex-col gap-0.5 border-l border-cyberGray/40 pl-3">
                    <span className="font-mono text-sm text-white font-bold">{b.title}</span>
                    <span className="font-mono text-xs text-cyberGray">by {b.author}</span>
                    <span className="font-mono text-xs text-neonYellow/70 italic">{b.why}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Movies */}
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-neonRed mb-4">
                🎬 Recommended Watching
              </p>
              <div className="space-y-3">
                {cat.movies.map((m) => (
                  <div key={m.title} className="flex flex-col gap-0.5 border-l border-cyberGray/40 pl-3">
                    <span className="font-mono text-sm text-white font-bold">{m.title} <span className="text-cyberGray font-normal">({m.year})</span></span>
                    <span className="font-mono text-xs text-neonRed/70 italic">{m.why}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Recommendations;
