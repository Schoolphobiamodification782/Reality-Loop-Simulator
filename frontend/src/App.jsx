import React, { useState } from 'react';
import Hero from './pages/Hero';
import InputPanel from './pages/InputPanel';
import Transition from './pages/Transition';
import ResultDashboard from './pages/ResultDashboard';
import ShockModeToggle from './components/ShockModeToggle';

function App() {
  const [step, setStep] = useState(0); // 0: Hero, 1: Input, 2: Transition, 3: Results
  const [shockMode, setShockMode] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulationFixed, setIsSimulationFixed] = useState(false);

  const simulateLife = async (inputs) => {
    setStep(2); // Transition screen
    try {
      const resp = await fetch('http://localhost:8000/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...inputs, shock_mode: shockMode })
      });
      const data = await resp.json();
      setSimulationResult(data);
      // Wait for 2 seconds to show transition messages
      setTimeout(() => {
        setStep(3);
      }, 2500);
    } catch (e) {
      console.error(e);
      alert("Simulation Engine Offline. Ensure backend is running.");
      setStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-darkerBg text-textMain selection:bg-neonRed selection:text-white flex flex-col relative overflow-hidden">
      <ShockModeToggle shockMode={shockMode} setShockMode={setShockMode} />
      
      {step === 0 && <Hero onStart={() => setStep(1)} shockMode={shockMode} />}
      {step === 1 && <InputPanel onSimulate={simulateLife} shockMode={shockMode} />}
      {step === 2 && <Transition shockMode={shockMode} />}
      {step === 3 && simulationResult && (
        <ResultDashboard 
          result={simulationResult} 
          shockMode={shockMode} 
          isFixed={isSimulationFixed}
          onFixHabits={() => {
            setIsSimulationFixed(true);
            setStep(1);
          }} 
          onRestart={() => {
            setIsSimulationFixed(false);
            setSimulationResult(null);
            setStep(0);
          }}
        />
      )}
    </div>
  );
}

export default App;
