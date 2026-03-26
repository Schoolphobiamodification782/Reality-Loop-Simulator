from pydantic import BaseModel
from typing import Dict, List

class SimulationInput(BaseModel):
    # --- Vitals ---
    sleep_hours: float              # 2–12
    wake_up_time: float             # 4–14
    diet_quality: int               # 1–10
    junk_food_frequency: int        # 0–10
    gym: bool
    outdoor_time: float             # hrs/week outdoors/walking

    # --- Psychology ---
    screen_time: float              # hrs/day (non-work)
    stress_level: int               # 1–10
    substance_use: int              # 0–10
    meditates: bool
    reading_hours: float            # hrs/week

    # --- Grind ---
    work_hours: float               # hrs/day
    income: float                   # annual USD
    social_hours: float             # hrs/week in-person interaction
    financial_discipline: int       # 1–10 (saving, budgeting)

    shock_mode: bool = False

class SimulationResult(BaseModel):
    # Core
    life_score: int
    income_5y: float
    income_growth: float
    burnout_level: str
    mental_state_score: str
    social_life_score: int
    time_wasted_hours: int
    wasted_days: int
    messages: List[str]

    # Deep V2
    biological_age_modifier: float
    dopamine_baseline: int
    relationship_health: int
    cognitive_decline_risk: str
    nutrition_score: int
    burnout_index: float
    radar_stats: Dict[str, int]
