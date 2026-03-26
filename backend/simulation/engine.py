from models.schemas import SimulationInput, SimulationResult
import math

def run_simulation(inputs: SimulationInput) -> SimulationResult:
    """
    Advanced interconnected life simulation.
    Each habit variable affects multiple downstream outcomes with weighted coefficients.
    """

    # ============================================================
    # 1. PHYSICAL HEALTH SYSTEM
    # ============================================================
    sleep_optimal_delta = inputs.sleep_hours - 8.0         # negative = deficit
    diet_norm = inputs.diet_quality / 10.0                  # 0–1
    substance_penalty = inputs.substance_use / 10.0         # 0–1
    exercise_bonus = 1.0 if inputs.gym else 0.0
    outdoor_bonus = min(inputs.outdoor_time / 14.0, 1.0)   # sweet-spot ~14 hrs/wk
    junk_food_penalty = inputs.junk_food_frequency / 10.0

    # Raw health score (0–100)
    health_raw = (
        50
        + (sleep_optimal_delta * 8)          # ±8 pts per hour deviation
        + (diet_norm * 20)                   # up to +20 for perfect diet
        - (junk_food_penalty * 12)           # up to -12 junk food
        - (substance_penalty * 25)           # up to -25 substances
        + (exercise_bonus * 15)              # +15 for gym
        + (outdoor_bonus * 8)               # +8 for outdoor time
    )
    health_stat = max(0, min(100, int(health_raw)))

    # Biological age acceleration (positive = aging faster)
    bio_age = (
        (substance_penalty * 8)
        + (max(0, -sleep_optimal_delta) * 1.5)
        + (junk_food_penalty * 3)
        - (diet_norm * 4)
        - (exercise_bonus * 3)
        - (outdoor_bonus * 2)
    )
    
    # Hydration / micro-nutrition proxy (via diet + junk food)
    nutrition_score = int((diet_norm - junk_food_penalty) * 100)
    nutrition_score = max(0, min(100, nutrition_score))

    # ============================================================
    # 2. PSYCHOLOGICAL / COGNITIVE SYSTEM
    # ============================================================
    screen_excess = max(0, inputs.screen_time - 2.0)           # hrs beyond healthy
    stress_norm = inputs.stress_level / 10.0
    meditation_factor = 1.0 if inputs.meditates else 0.0
    reading_bonus = min(inputs.reading_hours / 7.0, 1.0)       # daily sweet-spot

    # Dopamine receptor baseline (%)
    dopamine_raw = (
        100
        - (screen_excess * 7)
        - (substance_penalty * 30)
        - (stress_norm * 15)
        + (meditation_factor * 10)
        + (exercise_bonus * 8)
    )
    dopamine_baseline = max(0, min(100, int(dopamine_raw)))

    # Cognitive health
    cognitive_raw = (
        100
        + (sleep_optimal_delta * 6)
        - (stress_norm * 12)
        - (screen_excess * 4)
        + (reading_bonus * 15)
        + (meditation_factor * 8)
        + (diet_norm * 8)
        - (substance_penalty * 15)
    )
    cognition_stat = max(0, min(100, int(cognitive_raw)))

    cognitive_decline_risk = "LOW"
    if cognition_stat < 35: cognitive_decline_risk = "CRITICAL"
    elif cognition_stat < 60: cognitive_decline_risk = "HIGH"

    # Mental state / sanity
    sanity_raw = (
        100
        - (stress_norm * 30)
        - (max(0, inputs.work_hours - 9) * 5)
        + (meditation_factor * 12)
        + (outdoor_bonus * 8)
        + (math.log1p(max(0, inputs.social_hours)) * 5)
        - (substance_penalty * 10)
        + (sleep_optimal_delta * 5)
    )
    sanity_stat = max(0, min(100, int(sanity_raw)))

    # ============================================================
    # 3. BURNOUT SYSTEM (compound)
    # ============================================================
    work_pressure = inputs.work_hours / 8.0
    recovery_capacity = (
        1.0
        + (sleep_optimal_delta * 0.12)
        + (meditation_factor * 0.1)
        - (substance_penalty * 0.2)
        + (exercise_bonus * 0.1)
    )
    burnout_index = (work_pressure * stress_norm * 10) / max(0.3, recovery_capacity)

    burnout_level = "LOW"
    mental_state_score = "STABLE"
    if burnout_index >= 6.0:
        burnout_level = "CRITICAL"
        mental_state_score = "CRITICAL"
    elif burnout_index >= 3.5:
        burnout_level = "HIGH"
        mental_state_score = "LOW"

    # ============================================================
    # 4. SOCIAL / RELATIONSHIP SYSTEM
    # ============================================================
    work_isolation = max(0, inputs.work_hours - 8) * 2.5
    social_score_raw = (
        50
        + (math.log1p(inputs.social_hours) * 12)
        - work_isolation
        - (screen_excess * 3)
        + (outdoor_bonus * 6)
    )
    relationship_health = max(0, min(100, int(social_score_raw)))

    # ============================================================
    # 5. FINANCIAL / CAREER SYSTEM
    # ============================================================
    productivity_multiplier = (
        (cognition_stat / 100) *
        (sanity_stat / 100) *
        (health_stat / 100)
    )
    fin_discipline_norm = inputs.financial_discipline / 10.0

    income_multiplier = (
        1.0
        + (max(0, inputs.work_hours - 6) * 0.03)   # more hours → more income (capped)
        + (fin_discipline_norm * 0.4)               # saving/investing discipline
        - (max(0, burnout_index - 5) * 0.15)        # burnout kills performance
    ) * productivity_multiplier

    income_5y = round(inputs.income * max(0.5, income_multiplier) * 5, 2)
    income_growth = income_multiplier - 1.0          # % change proxy

    wealth_stat = max(0, min(100, int(
        (fin_discipline_norm * 50)
        + ((inputs.income / 200000) * 50)
        - (substance_penalty * 10)
    )))

    # ============================================================
    # 6. TIME WASTE SYSTEM
    # ============================================================
    wasted_daily_hrs = screen_excess                         # lazy but excess screen = waste
    time_wasted_hours = int(wasted_daily_hrs * 365 * 5)
    wasted_days = time_wasted_hours // 24

    # ============================================================
    # 7. LIFE SCORE (weighted composite)
    # ============================================================
    life_score = int(
        health_stat    * 0.22 +
        cognition_stat * 0.18 +
        sanity_stat    * 0.20 +
        wealth_stat    * 0.15 +
        relationship_health * 0.15 +
        dopamine_baseline   * 0.10
    )

    # ============================================================
    # 8. MESSAGES
    # ============================================================
    sm = inputs.shock_mode
    messages = []

    if dopamine_baseline < 45:
        messages.append(
            "Your dopamine receptors are eroded. You are chemically incapable of feeling real joy." if sm
            else "Dopamine baseline critically low from excessive screen/substance use.")
    if bio_age > 5:
        messages.append(
            f"Cellular aging accelerated. You are biologically {round(bio_age)} years older than your passport says." if sm
            else f"Biological age is +{round(bio_age)} years ahead of schedule.")
    if relationship_health < 35:
        messages.append(
            "You are constructing your own prison of isolation. No one will be there at the end." if sm
            else "Relationship bonds are critically weak. Isolation risk high.")
    if cognitive_decline_risk in ["HIGH", "CRITICAL"]:
        messages.append(
            "Neural degradation is accelerating. Memory gaps will appear within 2 years." if sm
            else "Cognitive performance at risk. Sleep and stress are the primary drivers.")
    if inputs.substance_use > 7:
        messages.append(
            "You are self-medicating a life you haven't chosen to fix yet." if sm
            else "Substance use is severely compromising long-term neurological health.")
    if burnout_level == "CRITICAL":
        messages.append(
            "A full system breakdown is not a risk — it is scheduled." if sm
            else "Burnout trajectory is critical. Career and health are both at risk.")
    if nutrition_score < 30:
        messages.append(
            "You are fueling a high-performance machine with garbage. The engine is failing." if sm
            else "Poor nutrition is silently accelerating biological decline.")
    if not messages:
        messages.append(
            "Optimal systemic integration. You are defying entropy. Rare." if sm
            else "Habits appear optimized. Compound growth is working in your favor.")

    return SimulationResult(
        life_score=life_score,
        income_5y=income_5y,
        income_growth=round(income_growth * 100, 1),
        burnout_level=burnout_level,
        mental_state_score=mental_state_score,
        social_life_score=relationship_health,
        time_wasted_hours=time_wasted_hours,
        wasted_days=wasted_days,
        messages=messages,
        biological_age_modifier=round(bio_age, 1),
        dopamine_baseline=dopamine_baseline,
        relationship_health=relationship_health,
        cognitive_decline_risk=cognitive_decline_risk,
        nutrition_score=nutrition_score,
        burnout_index=round(burnout_index, 2),
        radar_stats={
            "Sanity": sanity_stat,
            "Wealth": wealth_stat,
            "Health": health_stat,
            "Relationships": relationship_health,
            "Cognition": cognition_stat
        }
    )
