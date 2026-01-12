import React, { useEffect, useCallback } from 'react';
import styles from './ControlPanel.module.css';

interface InfoDialogProps {
  title: string;
  content: string;
  isOpen: boolean;
  onClose: () => void;
}

// Simple markdown-like text formatter
const formatContent = (text: string): React.ReactNode[] => {
  const paragraphs = text.split('\n\n');

  return paragraphs.map((paragraph, pIndex) => {
    // Process inline formatting within each paragraph
    const lines = paragraph.split('\n');
    const formattedLines = lines.map((line, lIndex) => {
      // Handle **bold** text
      const parts: React.ReactNode[] = [];
      let remaining = line;
      let keyIndex = 0;

      while (remaining.length > 0) {
        const boldMatch = remaining.match(/\*\*(.+?)\*\*/);

        if (boldMatch && boldMatch.index !== undefined) {
          // Add text before the match
          if (boldMatch.index > 0) {
            parts.push(remaining.substring(0, boldMatch.index));
          }
          // Add the bold text
          parts.push(
            <strong key={`b-${pIndex}-${lIndex}-${keyIndex++}`}>
              {boldMatch[1]}
            </strong>
          );
          remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
        } else {
          // No more matches, add remaining text
          parts.push(remaining);
          break;
        }
      }

      return (
        <React.Fragment key={`l-${pIndex}-${lIndex}`}>
          {parts}
          {lIndex < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });

    return <p key={`p-${pIndex}`}>{formattedLines}</p>;
  });
};

export const InfoDialog: React.FC<InfoDialogProps> = ({
  title,
  content,
  isOpen,
  onClose
}) => {
  // Handle escape key to close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className={styles.infoDialog} onClick={onClose}>
      <div
        className={styles.infoDialogContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.infoDialogHeader}>
          <h3 className={styles.infoDialogTitle}>{title}</h3>
          <button
            className={styles.infoDialogClose}
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className={styles.infoDialogBody}>
          {formatContent(content)}
        </div>
      </div>
    </div>
  );
};

export default InfoDialog;
