import React, { useState, useEffect, useRef, useMemo } from 'react';
import SparklesIcon from './icons/SparklesIcon';
import MarkdownRenderer from './MarkdownRenderer';
import { useTranslations } from '../contexts/LanguageContext';

interface LoaderProps {
  phase: 'enhance' | 'image';
  thought: string;
}

const Loader: React.FC<LoaderProps> = ({ phase, thought }) => {
  const { t, language } = useTranslations();
  
  const enhancementMessages = useMemo(() => [
    t('enhancingIdea'),
    t('addingMagic'),
    t('translatingVision'),
  ], [t]);

  const imageMessages = useMemo(() => [
    t('paintingWithPixels'),
    t('renderingMasterpiece'),
    t('warmingUpNanoBananas'),
  ], [t]);
  
  const [message, setMessage] = useState('');
  const messages = phase === 'enhance' ? enhancementMessages : imageMessages;
  const thoughtRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessage(messages[0]);
    const intervalDuration = phase === 'image' ? 4000 : 2500;
    const interval = setInterval(() => {
      setMessage(prev => {
        const currentIndex = messages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex];
      });
    }, intervalDuration);

    return () => clearInterval(interval);
  }, [phase, messages]);

  useEffect(() => {
    if (thoughtRef.current) {
        thoughtRef.current.scrollTo({
            top: thoughtRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [thought]);

  const renderTitle = () => {
    if (phase === 'enhance') {
      if (thought) {
        const agentDoingMagicText = t('agentDoingMagic');
        const promptMagicText = t('promptMagic');
        const parts = agentDoingMagicText.split(promptMagicText);
        return (
            <span>
                {parts[0]}
                <span className="flow-text-gradient font-serif-magic italic text-2xl">{promptMagicText}</span>
                {parts[1]}
            </span>
        );
      }
      const magicInProgressText = t('magicInProgress');
      const promptMagicText = t('promptMagic');
      const parts = magicInProgressText.split(promptMagicText);
      return (
        <span>
            <span className="flow-text-gradient font-serif-magic italic">{promptMagicText}</span>{parts[1]}...
        </span>
      );
    }
    
    if (phase === 'image') {
        const textToAnimate = "Nano Banana";
        const restOfText = ` ${t('creatingYourVision')}`;
        return (
            <span>
                {textToAnimate.split('').map((char, index) => (
                    <span 
                        key={index} 
                        className="nano-banana-letter" 
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                ))}
                {restOfText}
            </span>
        );
    }
    return null;
  };


  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-lg flex flex-col items-center justify-center z-50 p-4">
        <div 
            className="relative w-full max-w-2xl flow-border rounded-xl shadow-2xl shadow-black/50"
        >
             <div className="bg-background rounded-xl p-8 flex flex-col items-center text-center">
                <div className="w-12 h-12 text-white mb-4">
                    <SparklesIcon />
                </div>
                <h2 className="text-xl font-bold text-text-primary mb-2">
                    {renderTitle()}
                </h2>
                <p className="text-sm text-text-secondary mb-6 h-5 transition-opacity duration-300">
                    {phase === 'enhance' && thought ? ' ' : message}
                </p>
                
                <div className="w-full h-64">
                    {phase === 'enhance' && (
                        <div 
                            ref={thoughtRef}
                            className="w-full h-full bg-surface/50 rounded-lg border border-text-secondary/20 p-4 text-sm text-left text-text-secondary overflow-y-auto hide-scrollbar transition-opacity duration-500"
                            style={{ opacity: thought ? 1 : 0 }}
                        >
                            {thought ? <MarkdownRenderer content={thought} /> : <div />}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Loader;
