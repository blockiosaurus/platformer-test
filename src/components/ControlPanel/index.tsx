import React, { useCallback, useState, useEffect } from 'react';
import { EventBus } from '../../game/EventBus';
import { ParameterRegistry } from '../../game/config/ParameterRegistry';
import { PARAMETER_DEFINITIONS, getParametersByCategory } from '../../game/config/PlayerParameters';
import { PRESETS } from '../../game/config/ParameterPresets';
import { ParameterCategory } from '../../game/config/types';
import { ParameterSlider } from './ParameterSlider';
import { ParameterGroup } from './ParameterGroup';
import { PresetSelector } from './PresetSelector';
import { ExportImport } from './ExportImport';
import styles from './ControlPanel.module.css';

interface ControlPanelProps {
  paramRegistry: ParameterRegistry;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ paramRegistry }) => {
  const [values, setValues] = useState<Record<string, number>>(() => paramRegistry.getSnapshot());
  const [currentPreset, setCurrentPreset] = useState<string>('default');

  // Subscribe to parameter changes
  useEffect(() => {
    const unsubscribe = paramRegistry.subscribe((key, value) => {
      setValues(prev => ({ ...prev, [key]: value }));
    });

    // Also listen for preset loads and resets
    const handlePresetLoaded = () => {
      setValues(paramRegistry.getSnapshot());
    };

    const handleReset = () => {
      setValues(paramRegistry.getSnapshot());
      setCurrentPreset('default');
    };

    EventBus.on('preset-loaded', handlePresetLoaded);
    EventBus.on('parameters-reset', handleReset);
    EventBus.on('parameters-imported', handlePresetLoaded);

    return () => {
      unsubscribe();
      EventBus.off('preset-loaded', handlePresetLoaded);
      EventBus.off('parameters-reset', handleReset);
      EventBus.off('parameters-imported', handlePresetLoaded);
    };
  }, [paramRegistry]);

  const handleParameterChange = useCallback(
    (key: string, value: number) => {
      paramRegistry.set(key, value);
      setCurrentPreset(''); // Clear preset indicator when manually changing
    },
    [paramRegistry]
  );

  const handlePresetSelect = useCallback(
    (presetName: string) => {
      const preset = PRESETS[presetName];
      if (preset) {
        paramRegistry.loadPreset(preset.values);
        setCurrentPreset(presetName);
      }
    },
    [paramRegistry]
  );

  const handleReset = useCallback(() => {
    paramRegistry.reset();
    setCurrentPreset('default');
  }, [paramRegistry]);

  const handleExport = useCallback(() => {
    return paramRegistry.exportJSON();
  }, [paramRegistry]);

  const handleImport = useCallback(
    (json: string) => {
      const success = paramRegistry.importJSON(json);
      if (success) {
        setCurrentPreset('');
      }
      return success;
    },
    [paramRegistry]
  );

  const handleResetPlayer = useCallback(() => {
    EventBus.emit('reset-player');
  }, []);

  // Group parameters by category
  const groupedParams = getParametersByCategory();

  // Define category order
  const categoryOrder: ParameterCategory[] = [
    ParameterCategory.MOVEMENT,
    ParameterCategory.JUMP,
    ParameterCategory.DOUBLE_JUMP,
    ParameterCategory.COYOTE_TIME,
    ParameterCategory.JUMP_BUFFER,
    ParameterCategory.APEX_MODIFIER,
    ParameterCategory.WALL_MECHANICS,
    ParameterCategory.DASH
  ];

  return (
    <div className={styles.controlPanel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Game Feel Parameters</h2>
      </div>

      <PresetSelector onSelect={handlePresetSelect} currentPreset={currentPreset} />

      <div className={styles.groups}>
        {categoryOrder.map(category => {
          const params = groupedParams.get(category);
          if (!params || params.length === 0) return null;

          return (
            <ParameterGroup key={category} title={category} category={category}>
              {params.map(param => (
                <ParameterSlider
                  key={param.key}
                  definition={param}
                  value={values[param.key] ?? param.default}
                  onChange={handleParameterChange}
                />
              ))}
            </ParameterGroup>
          );
        })}
      </div>

      <div className={styles.actions}>
        <button
          className={styles.resetButton}
          onClick={handleReset}
          type="button"
        >
          Reset All
        </button>
        <button
          className={styles.resetButton}
          onClick={handleResetPlayer}
          type="button"
        >
          Reset Player (R)
        </button>
        <ExportImport onExport={handleExport} onImport={handleImport} />
      </div>
    </div>
  );
};

export default ControlPanel;
