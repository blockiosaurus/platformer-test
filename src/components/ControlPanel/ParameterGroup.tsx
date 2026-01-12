import React, { useState } from 'react';
import { ParameterCategory } from '../../game/config/types';
import { CATEGORY_DESCRIPTIONS } from '../../game/config/ParameterDescriptions';
import { InfoDialog } from './InfoDialog';
import styles from './ControlPanel.module.css';

interface ParameterGroupProps {
  title: string;
  category?: ParameterCategory;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}

export const ParameterGroup: React.FC<ParameterGroupProps> = ({
  title,
  category,
  children,
  defaultCollapsed = false
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [showInfo, setShowInfo] = useState(false);

  const categoryInfo = category ? CATEGORY_DESCRIPTIONS[category] : null;

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent collapse toggle
    setShowInfo(true);
  };

  return (
    <div className={styles.group}>
      <button
        className={styles.groupHeader}
        onClick={() => setCollapsed(!collapsed)}
        type="button"
      >
        <div className={styles.groupHeaderWithInfo}>
          <div className={styles.groupTitleWithInfo}>
            <span className={styles.groupTitle}>{title}</span>
            {categoryInfo && (
              <button
                className={`${styles.infoButton} ${styles.groupInfoButton}`}
                onClick={handleInfoClick}
                type="button"
                aria-label={`Info about ${title}`}
              >
                ?
              </button>
            )}
          </div>
          <span className={styles.collapseIcon}>{collapsed ? '+' : '-'}</span>
        </div>
      </button>
      {!collapsed && <div className={styles.groupContent}>{children}</div>}
      {categoryInfo && (
        <InfoDialog
          title={categoryInfo.title}
          content={categoryInfo.description}
          isOpen={showInfo}
          onClose={() => setShowInfo(false)}
        />
      )}
    </div>
  );
};

export default ParameterGroup;
