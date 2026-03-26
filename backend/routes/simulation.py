from fastapi import APIRouter
from models.schemas import SimulationInput, SimulationResult
from simulation.engine import run_simulation

router = APIRouter()

@router.post("/simulate", response_model=SimulationResult)
def simulate_life(inputs: SimulationInput):
    return run_simulation(inputs)
