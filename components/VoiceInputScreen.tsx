import React, { useRef, useState, useEffect } from 'react';
import useAudioRecorder from '../hooks/useAudioRecorder';
import MicrophoneIcon from './icons/MicrophoneIcon';
import ExclamationCircleIcon from './icons/ExclamationCircleIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';
import UploadIcon from './icons/UploadIcon';
import XMarkIcon from './icons/XMarkIcon';
import RecordingOverlay from './RecordingOverlay';
import { useTranslations } from '../contexts/LanguageContext';
import GlobeIcon from './icons/GlobeIcon';
import { TranslationKey } from '../lib/translations';

interface VoiceInputScreenProps {
  onVoiceSubmit: (audioBlob: Blob) => void;
  onTextSubmit: (text: string) => void;
  onImageUpload: (files: File[]) => void;
  uploadedImages?: File[];
  onRemoveImage: (index: number) => void;
  onImageEditSubmit: (prompt: string, files: File[]) => void;
  onVoiceWithImageSubmit: (audioBlob: Blob, files: File[]) => void;
}

const VoiceInputScreen: React.FC<VoiceInputScreenProps> = ({ 
    onVoiceSubmit, 
    onTextSubmit, 
    onImageUpload,
    uploadedImages,
    onRemoveImage,
    onImageEditSubmit,
    onVoiceWithImageSubmit
}) => {
  const { isRecording, error, startRecording, stopRecording, cancelRecording } = useAudioRecorder();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [textPrompt, setTextPrompt] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { t, language, setLanguage } = useTranslations();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'de' : 'en');
  };

  useEffect(() => {
    if (uploadedImages) {
        const urls = uploadedImages.map(file => URL.createObjectURL(file));
        setImageUrls(urls);
        return () => {
            urls.forEach(url => URL.revokeObjectURL(url));
        };
    }
    setImageUrls([]);
  }, [uploadedImages]);
  
  const handleMicClick = async () => {
    if (isRecording) {
      const audioBlob = await stopRecording();
      if (audioBlob && audioBlob.size > 1000) { // Check for minimal size to avoid empty submissions
        if (uploadedImages && uploadedImages.length > 0) {
          onVoiceWithImageSubmit(audioBlob, uploadedImages);
        } else {
          onVoiceSubmit(audioBlob);
        }
      }
    } else {
      startRecording();
    }
  };

  const handleCancelRecording = () => {
    cancelRecording();
  };
  
  const handleTextFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textPrompt.trim() || (uploadedImages && uploadedImages.length > 0)) {
        if (uploadedImages && uploadedImages.length > 0) {
            onImageEditSubmit(textPrompt.trim(), uploadedImages);
        } else {
            onTextSubmit(textPrompt.trim());
        }
        setTextPrompt('');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      onImageUpload(Array.from(files));
    }
    if (event.target) {
        event.target.value = ''; // Reset file input to allow re-uploading the same file
    }
  };

  const hasImages = uploadedImages && uploadedImages.length > 0;

  return (
    <>
      {isRecording && <RecordingOverlay onStop={handleMicClick} onCancel={handleCancelRecording} />}
      <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="w-full max-w-2xl flex-grow flex flex-col justify-center items-center">
              <div className="text-center mb-8">
                  <h1 className="text-[2.1rem] leading-tight sm:text-5xl font-bold tracking-tighter">
                      {t('voiceInputTitle1')}<br />
                      {t('voiceInputTitle2')}{' '}
                      <span className="font-serif-magic italic flow-text-gradient pr-2 -mr-2">{t('voiceInputTitle3')}</span>
                  </h1>
              </div>
              
              <button type="button" onClick={handleMicClick} className="h-24 w-24 flex items-center justify-center flow-gradient-background rounded-full text-white shadow-glow hover:opacity-90 transition-all duration-300 hover:scale-105" aria-label={isRecording ? t('stopRecording') : t('tapToSpeak')}>
                  <MicrophoneIcon className="w-10 h-10" />
              </button>
              <p className="text-text-secondary mt-4">{hasImages ? t('tapToDescribeEdits') : t('tapToSpeak')}</p>


              <div className="mt-8 text-center">
                  <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                      {showAdvanced ? t('hideAdvancedSettings') : t('advancedSettings')}
                  </button>
              </div>
              
              {showAdvanced && (
                  <form onSubmit={handleTextFormSubmit} className="w-full mt-4 transition-all duration-300">
                    <div className="flow-border rounded-2xl shadow-glow">
                        <div className="bg-surface rounded-2xl p-4 flex flex-col gap-3">
                           <textarea 
                              value={textPrompt}
                              onChange={(e) => setTextPrompt(e.target.value)}
                              onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleTextFormSubmit(e);
                                  }
                              }}
                              className="w-full bg-transparent focus:outline-none placeholder:text-text-secondary resize-none text-lg flex-grow hide-scrollbar"
                              placeholder={hasImages ? t('typeYourEdits') : t('typeYourIdea')}
                              rows={hasImages ? 2 : 4}
                          ></textarea>
                           <div className="flex items-end justify-between mt-2">
                               <div className="flex items-end gap-3 flex-1 min-w-0">
                                   <button type="button" onClick={() => fileInputRef.current?.click()} className="text-text-secondary hover:text-text-primary transition-colors p-2 rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed" aria-label={hasImages ? t('changeImage') : t('uploadImage')} disabled={uploadedImages && uploadedImages.length >= 7}>
                                      <UploadIcon className="w-6 h-6" />
                                   </button>
                                   <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" multiple />
                                    <div className="flex-1 flex items-center gap-3 overflow-x-auto hide-scrollbar">
                                       {imageUrls.map((url, index) => (
                                          <div key={index} className="relative w-20 h-20 flex-shrink-0">
                                              <img src={url} alt={`Upload preview ${index + 1}`} className="w-full h-full object-cover rounded-lg shadow-md" />
                                              <button
                                                  type="button"
                                                  onClick={() => onRemoveImage(index)}
                                                  className="absolute -top-2 -right-2 bg-background/80 backdrop-blur-sm rounded-full p-1 text-text-secondary hover:text-text-primary transition-all duration-200 ease-in-out hover:scale-110 shadow-lg"
                                                  aria-label={`Remove image ${index + 1}`}
                                              >
                                                  <XMarkIcon className="w-4 h-4" />
                                              </button>
                                          </div>
                                       ))}
                                   </div>
                               </div>

                               <button type="submit" className="h-10 w-10 flex items-center justify-center flow-gradient-background rounded-full text-white shadow-lg hover:opacity-90 transition-opacity" aria-label={t('submitPrompt')}>
                                  <ArrowRightIcon className="w-5 h-5" />
                               </button>
                           </div>
                        </div>
                    </div>
                  </form>
              )}
              
               {error && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg">
                      <ExclamationCircleIcon className="w-5 h-5"/>
                      <p className="text-sm">{t(error as TranslationKey)}</p>
                  </div>
              )}
          </div>
          <footer className="text-center py-4">
              <p className="text-xs text-text-secondary">
                {t('madeBy')}
                <a href="https://www.marlonkaulich.de" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary transition-colors">
                    Marlon Kaulich
                </a>
              </p>
              <button onClick={toggleLanguage} className="mt-2 text-xs text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5 mx-auto">
                <GlobeIcon className="w-4 h-4" />
                <span>{language === 'en' ? t('switchToGerman') : t('switchToEnglish')}</span>
              </button>
          </footer>
      </div>
    </>
  );
};

export default VoiceInputScreen;