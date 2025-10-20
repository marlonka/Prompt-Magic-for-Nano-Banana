import React from 'react';
import StopIcon from './icons/StopIcon';
import XMarkIcon from './icons/XMarkIcon';
import PulsingSoundWave from './PulsingSoundWave';
import { useTranslations } from '../contexts/LanguageContext';

interface RecordingOverlayProps {
  onStop: () => void;
  onCancel: () => void;
}

const RecordingOverlay: React.FC<RecordingOverlayProps> = ({ onStop, onCancel }) => {
  const { t } = useTranslations();

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-lg flex flex-col items-center justify-center z-50 p-4 modal-enter">
      <button
        onClick={onCancel}
        className="absolute top-6 right-6 text-text-secondary hover:text-text-primary transition-colors"
        aria-label={t('cancelRecording')}
      >
        <XMarkIcon className="w-8 h-8" />
      </button>
      <div className="text-center flex flex-col items-center">
        <h2 className="text-2xl font-bold text-text-primary mb-8">{t('listening')}</h2>
        <PulsingSoundWave />
        <button
          onClick={onStop}
          className="mt-12 h-20 w-20 flex items-center justify-center flow-gradient-background rounded-full text-white shadow-lg hover:opacity-90 transition-opacity"
          aria-label={t('stopRecording')}
        >
          <StopIcon className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

export default RecordingOverlay;
