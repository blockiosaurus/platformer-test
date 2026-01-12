import React from 'react';
import { PRESETS, getPresetNames } from '../../game/config/ParameterPresets';
import styles from './ControlPanel.module.css';

interface PresetSelectorProps {
  onSelect: (presetName: string) => void;
  currentPreset?: string;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  onSelect,
  currentPreset
}) => {
  const presetNames = getPresetNames();

  return (
    <div className={styles.presetSelector}>
      <label className={styles.presetLabel}>Presets:</label>
      <div className={styles.presetButtons}>
        {presetNames.map(name => {
          const preset = PRESETS[name];
          return (
            <button
              key={name}
              className={`${styles.presetButton} ${currentPreset === name ? styles.presetActive : ''}`}
              onClick={() => onSelect(name)}
              title={preset.description}
              type="button"
            >
              {preset.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PresetSelector;
