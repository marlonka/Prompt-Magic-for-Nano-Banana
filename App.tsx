import React, { useState, useCallback } from 'react';
import { AppState, GeneratedImageData } from './types';
import * as geminiService from './services/geminiService';
import VoiceInputScreen from './components/VoiceInputScreen';
import ImageDisplayScreen from './components/ImageDisplayScreen';
import PromptIdeasScreen from './components/PromptIdeasScreen';
import Loader from './components/Loader';
import Header from './components/Header';
import { useTranslations } from './contexts/LanguageContext';
import { TranslationKey } from './lib/translations';


const App: React.FC = () => {
  const { t } = useTranslations();
  const [appState, setAppState] = useState<AppState>({ screen: 'HOME', uploadedImages: [] });
  const [currentThought, setCurrentThought] = useState<string>('');

  const handleError = (error: any, messageKey: TranslationKey) => {
      console.error(error);
      setAppState({ screen: 'ERROR', message: t(messageKey) });
  }
  
  const handleThoughtUpdate = (thought: string) => {
    setCurrentThought(prev => prev + thought);
  };

  const handleVoiceSubmit = useCallback(async (audioBlob: Blob) => {
    setAppState({ screen: 'GENERATING', phase: 'enhance' });
    setCurrentThought('');
    try {
      const { originalPrompt, magicPrompt, aspectRatio } = await geminiService.transcribeAndEnhancePrompt(audioBlob, handleThoughtUpdate);
      setAppState({ screen: 'GENERATING', phase: 'image' });
      const imageUrl = await geminiService.generateImage(magicPrompt, aspectRatio);
      setAppState({
        screen: 'DISPLAY',
        data: { originalPrompt, magicPrompt, imageUrl, baseImageUrl: null }
      });
    } catch (error) {
      handleError(error, 'failedToGenerateImage');
    }
  }, [t]);

  const handleTextSubmit = useCallback(async (text: string) => {
    setAppState({ screen: 'GENERATING', phase: 'enhance' });
    setCurrentThought('');
    try {
      const { magicPrompt, aspectRatio } = await geminiService.enhancePrompt(text, handleThoughtUpdate);
      setAppState({ screen: 'GENERATING', phase: 'image' });
      const imageUrl = await geminiService.generateImage(magicPrompt, aspectRatio);
      setAppState({
        screen: 'DISPLAY',
        data: { originalPrompt: text, magicPrompt, imageUrl, baseImageUrl: null }
      });
    } catch (error) {
      handleError(error, 'failedToGenerateImage');
    }
  }, [t]);
  
  const handleImagePromptSubmit = useCallback(async (prompt: string, files: File[]) => {
    if (files.length === 0) return;
    setAppState({ screen: 'GENERATING', phase: 'enhance' });
    setCurrentThought('');
    try {
        const baseImage = files[0];
        const contextImages = files.slice(1);

        const { magicPrompt } = await geminiService.enhancePrompt(prompt, handleThoughtUpdate, true, baseImage, contextImages);

        setAppState({ screen: 'GENERATING', phase: 'image' });
        setCurrentThought(''); 

        const newImageUrl = await geminiService.editImage(magicPrompt, baseImage, contextImages);
        const baseImageUrl = URL.createObjectURL(baseImage);

        setAppState({
            screen: 'DISPLAY',
            data: {
                originalPrompt: prompt,
                magicPrompt: magicPrompt,
                imageUrl: newImageUrl,
                baseImageUrl: baseImageUrl
            }
        });
    } catch (error) {
        handleError(error, 'failedToEditImageWithPrompt');
    }
  }, [t]);
  
  // FIX: Create a wrapper to handle single file submissions from PromptIdeasScreen.
  const handleSingleImagePromptSubmit = useCallback((prompt: string, file: File) => {
    handleImagePromptSubmit(prompt, [file]);
  }, [handleImagePromptSubmit]);

  const handleVoiceWithImageSubmit = useCallback(async (audioBlob: Blob, files: File[]) => {
    if (files.length === 0) return;
    setAppState({ screen: 'GENERATING', phase: 'enhance' });
    setCurrentThought('');
    try {
      const baseImage = files[0];
      const contextImages = files.slice(1);
      
      const { originalPrompt, magicPrompt } = await geminiService.transcribeAndEnhancePrompt(audioBlob, handleThoughtUpdate, true, baseImage, contextImages);

      setAppState({ screen: 'GENERATING', phase: 'image' });
      setCurrentThought('');

      const newImageUrl = await geminiService.editImage(magicPrompt, baseImage, contextImages);
      const baseImageUrl = URL.createObjectURL(baseImage);

      setAppState({
          screen: 'DISPLAY',
          data: {
              originalPrompt,
              magicPrompt,
              imageUrl: newImageUrl,
              baseImageUrl: baseImageUrl
          }
      });
    } catch (error) {
       handleError(error, 'failedToEditImage');
    }
  }, [t]);

  const handleEditSubmit = useCallback(async (audioBlob: Blob | null, text: string | null, editData: GeneratedImageData, editImages: File[] | null) => {
    setAppState({ screen: 'GENERATING', phase: 'enhance' });
    setCurrentThought('');
     try {
      let originalPrompt: string, magicPrompt: string;
      
      const baseImageBlob = await fetch(editData.imageUrl).then(r => r.blob());
      const promptImageBlobs = editImages || [];

      if (audioBlob) {
          ({ originalPrompt, magicPrompt } = await geminiService.transcribeAndEnhancePrompt(audioBlob, handleThoughtUpdate, true, baseImageBlob, promptImageBlobs));
      } else if (text) {
          ({ originalPrompt, magicPrompt } = await geminiService.enhancePrompt(text, handleThoughtUpdate, true, baseImageBlob, promptImageBlobs));
      } else if (promptImageBlobs.length > 0) {
          // Allow submitting with only images
          originalPrompt = '';
          ({ magicPrompt } = await geminiService.enhancePrompt('', handleThoughtUpdate, true, baseImageBlob, promptImageBlobs));
      }
      else {
        handleError(new Error("No input provided for editing."), 'noInputForEditing');
        return;
      }
      
      setAppState({ screen: 'GENERATING', phase: 'image' });
      setCurrentThought('');
      
      const newImageUrl = await geminiService.editImage(magicPrompt, baseImageBlob, promptImageBlobs);

      setAppState({
        screen: 'DISPLAY',
        data: { originalPrompt, magicPrompt, imageUrl: newImageUrl, baseImageUrl: editData.imageUrl }
      });
    } catch (error) {
       handleError(error, 'failedToEditImage');
    }
  }, [t]);

  const handleImageUpload = (files: File[]) => {
    setAppState(prevState => {
      if (prevState.screen === 'HOME') {
        const currentImages = prevState.uploadedImages || [];
        const newImages = [...currentImages, ...files].slice(0, 7); // Max 7 images
        return { ...prevState, uploadedImages: newImages };
      }
      return prevState;
    });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setAppState(prevState => {
      if (prevState.screen === 'HOME' && prevState.uploadedImages) {
        return {
          ...prevState,
          uploadedImages: prevState.uploadedImages.filter((_, index) => index !== indexToRemove),
        };
      }
      return prevState;
    });
  };
  
  const handleReset = () => {
    setAppState({ screen: 'HOME', uploadedImages: [] });
  };


  const renderContent = () => {
    switch (appState.screen) {
      case 'HOME':
        return <VoiceInputScreen 
            onVoiceSubmit={handleVoiceSubmit} 
            onTextSubmit={handleTextSubmit} 
            onImageUpload={handleImageUpload}
            uploadedImages={appState.uploadedImages}
            onRemoveImage={handleRemoveImage}
            onImageEditSubmit={handleImagePromptSubmit}
            onVoiceWithImageSubmit={handleVoiceWithImageSubmit}
        />;
      case 'PROMPT_IDEAS':
        // FIX: Pass the single-file handler to PromptIdeasScreen to resolve type mismatch.
        return <PromptIdeasScreen onPromptClick={handleTextSubmit} onImagePromptSubmit={handleSingleImagePromptSubmit} />;
      case 'GENERATING':
        return <Loader phase={appState.phase} thought={currentThought} />;
      case 'DISPLAY':
        return <ImageDisplayScreen data={appState.data} onEditSubmit={handleEditSubmit} onReset={handleReset} />;
      case 'ERROR':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <h2 className="text-2xl font-bold text-red-500 mb-4">{t('anErrorOccurred')}</h2>
            <p className="text-text-secondary mb-6">{appState.message}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-primary text-background font-semibold rounded-full shadow-md hover:opacity-90 transition-colors"
            >
              {t('tryAgain')}
            </button>
          </div>
        );
    }
  };

  return (
    <div className="h-screen w-screen bg-background text-text-primary font-display selection:bg-primary/30 flex flex-col overflow-hidden">
        <Header appState={appState} setAppState={setAppState} />
        <main className="flex-1 h-full overflow-y-auto custom-scrollbar">
          {renderContent()}
        </main>
    </div>
  );
};

export default App;
