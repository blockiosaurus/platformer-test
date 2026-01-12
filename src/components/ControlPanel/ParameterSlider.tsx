import React, { useCallback, useState } from 'react';
import { ParameterDefinition } from '../../game/config/types';
import { PARAMETER_EXTENDED_DESCRIPTIONS } from '../../game/config/ParameterDescriptions';
import { InfoDialog } from './InfoDialog';
import styles from './ControlPanel.module.css';

interface ParameterSliderProps {
  definition: ParameterDefinition;
  value: number;
  onChange: (key: string, value: number) => void;
}

export const ParameterSlider: React.FC<ParameterSliderProps> = ({
  definition,
  value,
  onChange
}) => {
  const { key, label, min, max, step, unit, description } = definition;
  const [showInfo, setShowInfo] = useState(false);

  const extendedDescription = PARAMETER_EXTENDED_DESCRIPTIONS[key];

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(key, parseFloat(e.target.value));
    },
    [key, onChange]
  );

  // Format display value based on step size
  const formatValue = (val: number): string => {
    if (step < 1) {
      return val.toFixed(2);
    }
    return val.toString();
  };

  // Calculate percentage for gradient background
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={styles.sliderContainer} title={description}>
      <div className={styles.labelRowWithInfo}>
        <div className={styles.labelWithInfo}>
          <label htmlFor={key} className={styles.label}>
            {label}
          </label>
          {extendedDescription && (
            <button
              className={styles.infoButton}
              onClick={() => setShowInfo(true)}
              type="button"
              aria-label={`Info about ${label}`}
            >
              ?
            </button>
          )}
        </div>
        <span className={styles.value}>
          {formatValue(value)}
          {unit && <span className={styles.unit}>{unit}</span>}
        </span>
      </div>
      <input
        id={key}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className={styles.slider}
        style={{
          background: `linear-gradient(to right, #4a9eff 0%, #4a9eff ${percentage}%, #333344 ${percentage}%, #333344 100%)`
        }}
      />
      {extendedDescription && (
        <InfoDialog
          title={label}
          content={extendedDescription}
          isOpen={showInfo}
          onClose={() => setShowInfo(false)}
        />
      )}
    </div>
  );
};

export default ParameterSlider;
