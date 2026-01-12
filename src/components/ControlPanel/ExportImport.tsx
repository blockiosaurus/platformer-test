import React, { useRef, useState } from 'react';
import styles from './ControlPanel.module.css';

interface ExportImportProps {
  onExport: () => string;
  onImport: (json: string) => boolean;
}

export const ExportImport: React.FC<ExportImportProps> = ({
  onExport,
  onImport
}) => {
  const [showModal, setShowModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleExport = () => {
    const json = onExport();
    setImportText(json);
    setShowModal(true);
    setError('');
    // Select all text after render
    setTimeout(() => {
      textareaRef.current?.select();
    }, 50);
  };

  const handleImport = () => {
    if (!importText.trim()) {
      setError('Please paste JSON configuration');
      return;
    }

    const success = onImport(importText);
    if (success) {
      setShowModal(false);
      setImportText('');
      setError('');
    } else {
      setError('Invalid JSON format');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(importText);
  };

  return (
    <>
      <div className={styles.exportImportButtons}>
        <button
          className={styles.actionButton}
          onClick={handleExport}
          type="button"
        >
          Export
        </button>
        <button
          className={styles.actionButton}
          onClick={() => {
            setShowModal(true);
            setImportText('');
            setError('');
          }}
          type="button"
        >
          Import
        </button>
      </div>

      {showModal && (
        <div className={styles.modal} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Export / Import Configuration</h3>
            <textarea
              ref={textareaRef}
              className={styles.jsonTextarea}
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder="Paste JSON configuration here..."
              spellCheck={false}
            />
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.modalButtons}>
              <button
                className={styles.actionButton}
                onClick={handleCopy}
                type="button"
              >
                Copy
              </button>
              <button
                className={styles.actionButton}
                onClick={handleImport}
                type="button"
              >
                Apply
              </button>
              <button
                className={styles.actionButton}
                onClick={() => setShowModal(false)}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExportImport;
