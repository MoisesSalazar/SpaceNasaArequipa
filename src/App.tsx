import React, { useState } from 'react';
import SolarSystem from './components/SolarSystem';
import Presentation from './components/Presentation';
import Header from './components/Header'; // Importar el componente Header
import './App.css';
import './index.css';

function App() {
  const [showPresentation, setShowPresentation] = useState(true);

  const handleStartJourney = () => {
    setShowPresentation(false);
  };

  return (
    <>
      <Header /> {/* Usar el componente Header */}
      {showPresentation ? (
        <Presentation onStartJourney={handleStartJourney} />
      ) : (
        <SolarSystem />
      )}
    </>
  );
}

export default App;