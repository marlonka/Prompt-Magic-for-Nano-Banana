import React, { useState, useRef, useEffect } from 'react';
import { GeneratedImageData } from '../types';
import useAudioRecorder from '../hooks/useAudioRecorder';
import SparklesIcon from './icons/SparklesIcon';
import DownloadIcon from './icons/DownloadIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';
import ExclamationCircleIcon from './icons/ExclamationCircleIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';
import ImageModal from './ImageModal';
import PlusIcon from './icons/PlusIcon';
import UploadIcon from './icons/UploadIcon';
import XMarkIcon from './icons/XMarkIcon';
import RecordingOverlay from './RecordingOverlay';
import { useTranslations } from '../contexts/LanguageContext';
import { TranslationKey } from '../lib/translations';

interface ImageDisplayScreenProps {
  data: GeneratedImageData;
  onEditSubmit: (audioBlob: Blob | null, text: string | null, currentData: GeneratedImageData, editImages: File[] | null) => void;
  onReset: () => void;
}

const ImageDisplayScreen: React.FC<ImageDisplayScreenProps> = ({ data, onEditSubmit, onReset }) => {
  const [textPrompt, setTextPrompt] = useState('');
  const { isRecording, error, startRecording, stopRecording, cancelRecording } = useAudioRecorder();
  const [isBaseImageModalOpen, setIsBaseImageModalOpen] = useState(false);
  const [isMainImageModalOpen, setIsMainImageModalOpen] = useState(false);
  const promptMagicRef = useRef<HTMLDivElement>(null);
  const userHasScrolled = useRef(false);
  const { t } = useTranslations();

  const [editImageFiles, setEditImageFiles] = useState<File[]>([]);
  const [editImageUrls, setEditImageUrls] = useState<string[]>([]);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  
  const [showAdvancedEdit, setShowAdvancedEdit] = useState(false);

  useEffect(() => {
    const urls = editImageFiles.map(file => URL.createObjectURL(file));
    setEditImageUrls(urls);
    return () => {
        urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [editImageFiles]);

  useEffect(() => {
    const scrollableDiv = promptMagicRef.current;
    if (!scrollableDiv || userHasScrolled.current) return;

    if (scrollableDiv.scrollHeight <= scrollableDiv.clientHeight) return;

    let animationFrameId: number;
    let start: number | null = null;
    const duration = 8000;
    const startScroll = scrollableDiv.scrollTop;
    const endScroll = scrollableDiv.scrollHeight - scrollableDiv.clientHeight;

    const animateScroll = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = -(Math.cos(Math.PI * progress) - 1) / 2;
        scrollableDiv.scrollTop = startScroll + (endScroll - startScroll) * ease;
        if (elapsed < duration) {
            animationFrameId = requestAnimationFrame(animateScroll);
        }
    };

    const handleUserScroll = () => {
        userHasScrolled.current = true;
        cancelAnimationFrame(animationFrameId);
        scrollableDiv?.removeEventListener('wheel', handleUserScroll);
        scrollableDiv?.removeEventListener('touchmove', handleUserScroll);
    };

    scrollableDiv.addEventListener('wheel', handleUserScroll);
    scrollableDiv.addEventListener('touchmove', handleUserScroll);
    
    setTimeout(() => {
      animationFrameId = requestAnimationFrame(animateScroll);
    }, 500);

    return () => {
        cancelAnimationFrame(animationFrameId);
        scrollableDiv?.removeEventListener('wheel', handleUserScroll);
        scrollableDiv?.removeEventListener('touchmove', handleUserScroll);
    };
  }, [data.magicPrompt]);

  const handleSave = () => {
    const link = document.createElement('a');
    link.href = data.imageUrl;
    link.download = `gemini-flow-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMicClick = async () => {
    if (isRecording) {
      const audioBlob = await stopRecording();
      if (audioBlob && audioBlob.size > 1000) {
        onEditSubmit(audioBlob, null, data, editImageFiles);
        setEditImageFiles([]);
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
    if (textPrompt.trim() || editImageFiles.length > 0) {
      onEditSubmit(null, textPrompt.trim(), data, editImageFiles);
      setTextPrompt('');
      setEditImageFiles([]);
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setEditImageFiles(prev => [...prev, ...Array.from(files)].slice(0, 7));
    }
    if (event.target) {
        event.target.value = '';
    }
  };

  const handleRemoveEditImage = (indexToRemove: number) => {
    setEditImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const hasContextImages = editImageFiles.length > 0;

  return (
    <>
      {isRecording && <RecordingOverlay onStop={handleMicClick} onCancel={handleCancelRecording} />}
      <div className="min-h-full container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          <div className="lg:w-3/5 flex flex-col gap-6">
              <div className="relative w-full rounded-2xl shadow-2xl shadow-black/30 overflow-hidden bg-background flex justify-center items-center">
                  <img 
                    src={data.imageUrl} 
                    alt={data.magicPrompt} 
                    className="w-full h-auto block object-contain max-h-[calc(100vh-12rem)] cursor-pointer rounded-2xl"
                    onClick={() => setIsMainImageModalOpen(true)}
                  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="flow-border interactive-item rounded-full">
                    <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-surface text-text-primary font-bold text-sm transition-colors">
                        <DownloadIcon className="w-5 h-5" />
                        <span>{t('save')}</span>
                    </button>
                  </div>
                   <div className="flow-border interactive-item rounded-full">
                    <button onClick={onReset} className="w-full flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-surface text-text-primary font-bold text-sm transition-colors">
                        <ArrowPathIcon className="w-5 h-5" />
                        <span>{t('newCreation')}</span>
                    </button>
                  </div>
              </div>
          </div>

          <div className="lg:w-2/5 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-text-secondary">{t('originalPrompt')}</h3>
                <div className="relative p-4 rounded-lg bg-surface border border-text-secondary/20 text-base text-text-secondary/90 italic">
                    <div className="flex items-center gap-3">
                      {data.baseImageUrl && (
                        <>
                          <img 
                            src={data.baseImageUrl} 
                            alt="Original prompt image" 
                            className="w-12 h-12 rounded-md cursor-pointer hover:scale-110 transition-transform"
                            onClick={() => setIsBaseImageModalOpen(true)}
                          />
                          <PlusIcon className="w-4 h-4 text-text-secondary flex-shrink-0"/>
                        </>
                      )}
                      <span>"{data.originalPrompt}"</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-medium flex items-center gap-1.5">
                      <SparklesIcon className="w-4 h-4 text-white" />
                      <span className="flow-text-gradient text-transparent font-serif-magic italic text-base">{t('promptMagic')}</span>
                  </h3>
                  <div ref={promptMagicRef} className="relative p-4 rounded-lg bg-surface text-base text-text-primary max-h-56 overflow-y-auto custom-scrollbar border border-text-secondary/20">
                      {data.magicPrompt}
                  </div>
            </div>

            <div className="flex-grow"></div>

            <div className="flex flex-col gap-4 pt-6 border-t border-text-secondary/20 items-center">
              <p className="font-semibold text-lg text-text-primary">{t('editWith')} <span className="font-serif-magic italic flow-text-gradient">{t('promptMagic')}</span></p>

              <button type="button" onClick={handleMicClick} className="h-20 w-20 flex items-center justify-center flow-gradient-background rounded-full text-white shadow-glow hover:opacity-90 transition-all duration-300 hover:scale-105" aria-label={isRecording ? t('stopRecording') : t('speakYourEdits')}>
                  <MicrophoneIcon className="w-8 h-8" />
              </button>
              <p className="text-text-secondary mt-2 text-sm">{t('speakYourEdits')}</p>

              <div className="mt-4 text-center">
                  <button onClick={() => setShowAdvancedEdit(!showAdvancedEdit)} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                      {showAdvancedEdit ? t('hideAdvancedSettings') : t('advancedSettings')}
                  </button>
              </div>

              {showAdvancedEdit && (
                <div className="w-full mt-2">
                  <form onSubmit={handleTextFormSubmit} className="w-full">
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
                                  placeholder={t('typeYourEdits')}
                                  rows={hasContextImages ? 2 : 4}
                              ></textarea>
                               <div className="flex items-end justify-between mt-2">
                                  <div className="flex items-end gap-3 flex-1 min-w-0">
                                    <button type="button" onClick={() => editFileInputRef.current?.click()} className="text-text-secondary hover:text-text-primary transition-colors p-2 rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed" aria-label={hasContextImages ? t('changeContextImage') : t('addContextImage')} disabled={editImageFiles.length >= 7}>
                                      <UploadIcon className="w-6 h-6" />
                                    </button>
                                    <input type="file" ref={editFileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" multiple/>
                                    <div className="flex-1 flex items-center gap-3 overflow-x-auto hide-scrollbar">
                                      {editImageUrls.map((url, index) => (
                                          <div key={index} className="relative w-20 h-20 flex-shrink-0">
                                              <img src={url} alt={`Edit prompt preview ${index + 1}`} className="w-full h-full object-cover rounded-lg shadow-md" />
                                              <button
                                                  type="button"
                                                  onClick={() => handleRemoveEditImage(index)}
                                                  className="absolute -top-2 -right-2 bg-background/80 backdrop-blur-sm rounded-full p-1 text-text-secondary hover:text-text-primary transition-all duration-200 ease-in-out hover:scale-110 shadow-lg"
                                                  aria-label={`Remove edit image ${index + 1}`}
                                              >
                                                  <XMarkIcon className="w-4 h-4" />
                                              </button>
                                          </div>
                                      ))}
                                    </div>
                                  </div>

                                  <button type="submit" className="h-10 w-10 flex items-center justify-center flow-gradient-background rounded-full text-white shadow-lg hover:opacity-90 transition-opacity" aria-label={t('submitEdits')}>
                                      <ArrowRightIcon className="w-5 h-5" />
                                  </button>
                              </div>
                          </div>
                      </div>
                  </form>
                </div>
              )}
                
              {error && (
                  <div className="mt-2 flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg w-full">
                      <ExclamationCircleIcon className="w-5 h-5"/>
                      <p className="text-sm">{t(error as TranslationKey)}</p>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {isBaseImageModalOpen && data.baseImageUrl && (
        <ImageModal src={data.baseImageUrl} onClose={() => setIsBaseImageModalOpen(false)} />
      )}
      {isMainImageModalOpen && (
        <ImageModal src={data.imageUrl} onClose={() => setIsMainImageModalOpen(false)} />
      )}
    </>
  );
};

export default ImageDisplayScreen;