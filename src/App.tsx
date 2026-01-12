import { useRef, useState, useEffect } from 'react';
import { IRefPhaserGame, PhaserGame } from './PhaserGame';
import { ControlPanel } from './components/ControlPanel';
import { DebugOverlay } from './components/DebugOverlay';
import { ParameterRegistry, getGlobalRegistry, setGlobalRegistry } from './game/config/ParameterRegistry';
import { EventBus } from './game/EventBus';

function App() {
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  const [paramRegistry] = useState<ParameterRegistry>(() => {
    const registry = new ParameterRegistry();
    setGlobalRegistry(registry);
    return registry;
  });
  const [showDebugOverlay, setShowDebugOverlay] = useState(false);

  useEffect(() => {
    // Listen for debug toggle from Phaser
    const handleDebugToggle = () => {
      setShowDebugOverlay(prev => !prev);
    };

    // Toggle when F1 is pressed in React context as well
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setShowDebugOverlay(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const currentScene = (scene: Phaser.Scene) => {
    // Scene is ready
    console.log('Scene ready:', scene.scene.key);
  };

  return (
    <div id="app">
      <div className="game-wrapper">
        <div className="game-container">
          <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
          <DebugOverlay visible={showDebugOverlay} />
        </div>
      </div>
      <div className="control-panel-wrapper">
        <ControlPanel paramRegistry={paramRegistry} />
      </div>
    </div>
  );
}

export default App;
