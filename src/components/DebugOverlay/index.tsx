import React, { useEffect, useState } from 'react';
import { EventBus } from '../../game/EventBus';
import { PlayerDebugInfo, InputSnapshot } from '../../game/config/types';
import styles from './DebugOverlay.module.css';

interface ExtendedDebugInfo extends PlayerDebugInfo {
  fps: number;
  inputs: InputSnapshot;
}

interface DebugOverlayProps {
  visible?: boolean;
}

export const DebugOverlay: React.FC<DebugOverlayProps> = ({ visible = false }) => {
  const [debugInfo, setDebugInfo] = useState<ExtendedDebugInfo | null>(null);

  useEffect(() => {
    const handleDebugInfo = (info: ExtendedDebugInfo) => {
      setDebugInfo(info);
    };

    EventBus.on('debug-info', handleDebugInfo);

    return () => {
      EventBus.off('debug-info', handleDebugInfo);
    };
  }, []);

  if (!visible || !debugInfo) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Performance</div>
        <div className={styles.row}>
          <span className={styles.label}>FPS:</span>
          <span className={styles.value}>{debugInfo.fps}</span>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>State</div>
        <div className={styles.stateValue}>{debugInfo.state.toUpperCase()}</div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Position</div>
        <div className={styles.row}>
          <span className={styles.label}>X:</span>
          <span className={styles.value}>{debugInfo.position.x}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Y:</span>
          <span className={styles.value}>{debugInfo.position.y}</span>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Velocity</div>
        <div className={styles.row}>
          <span className={styles.label}>X:</span>
          <span className={styles.value}>{debugInfo.velocity.x}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Y:</span>
          <span className={styles.value}>{debugInfo.velocity.y}</span>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Flags</div>
        <div className={styles.flags}>
          <span className={`${styles.flag} ${debugInfo.isGrounded ? styles.active : ''}`}>
            GND
          </span>
          <span className={`${styles.flag} ${debugInfo.isTouchingWall ? styles.active : ''}`}>
            WALL
          </span>
          <span className={`${styles.flag} ${debugInfo.isAtApex ? styles.active : ''}`}>
            APEX
          </span>
          <span className={`${styles.flag} ${debugInfo.canDash ? styles.active : ''}`}>
            DASH
          </span>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Timers</div>
        <div className={styles.row}>
          <span className={styles.label}>Coyote:</span>
          <span className={styles.value}>{debugInfo.coyoteTimer.toFixed(0)}ms</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Dash CD:</span>
          <span className={styles.value}>{debugInfo.dashCooldown.toFixed(0)}ms</span>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Resources</div>
        <div className={styles.row}>
          <span className={styles.label}>Jumps:</span>
          <span className={styles.value}>{debugInfo.jumpsRemaining}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Dashes:</span>
          <span className={styles.value}>{debugInfo.dashesRemaining}</span>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Input</div>
        <div className={styles.inputDisplay}>
          <span className={`${styles.inputKey} ${debugInfo.inputs.horizontal < 0 ? styles.active : ''}`}>
            {'<'}
          </span>
          <span className={`${styles.inputKey} ${debugInfo.inputs.horizontal > 0 ? styles.active : ''}`}>
            {'>'}
          </span>
          <span className={`${styles.inputKey} ${debugInfo.inputs.jumpPressed ? styles.active : ''}`}>
            JMP
          </span>
          <span className={`${styles.inputKey} ${debugInfo.inputs.dashJustPressed ? styles.active : ''}`}>
            DSH
          </span>
        </div>
      </div>
    </div>
  );
};

export default DebugOverlay;
