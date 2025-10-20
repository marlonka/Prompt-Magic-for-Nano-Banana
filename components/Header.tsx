import React, { useState, useRef, useEffect } from 'react';
import { AppState } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import ImageIcon from './icons/ImageIcon';
import { useTranslations } from '../contexts/LanguageContext';

interface HeaderProps {
  appState: AppState;
  setAppState: (state: AppState) => void;
}

const Header: React.FC<HeaderProps> = ({ appState, setAppState }) => {
    const navRef = useRef<HTMLElement>(null);
    const generateLinkRef = useRef<HTMLAnchorElement>(null);
    const ideasLinkRef = useRef<HTMLAnchorElement>(null);
    const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({ opacity: 0 });
    const { t } = useTranslations();

    const isGenerateScreen = ['HOME', 'GENERATING', 'DISPLAY', 'ERROR'].includes(appState.screen);
    const isIdeasScreen = appState.screen === 'PROMPT_IDEAS';

    useEffect(() => {
        if (!navRef.current) return;

        const navRect = navRef.current.getBoundingClientRect();
        let targetRect;
        
        if (isGenerateScreen && generateLinkRef.current) {
            targetRect = generateLinkRef.current.getBoundingClientRect();
        } else if (isIdeasScreen && ideasLinkRef.current) {
            targetRect = ideasLinkRef.current.getBoundingClientRect();
        }

        if (targetRect) {
            setHighlightStyle({
                transform: `translateX(${targetRect.left - navRect.left}px)`,
                width: `${targetRect.width}px`,
                height: `${targetRect.height}px`,
                opacity: 1
            });
        }
    }, [appState.screen, isGenerateScreen, isIdeasScreen]);
    
    const getLinkClass = (isActive: boolean) => {
        const baseClass = "relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ease-in-out";
        if (isActive) {
            return `${baseClass} text-white`;
        }
        return `${baseClass} text-text-secondary hover:text-text-primary`;
    };

    return (
        <header className="flex-shrink-0 bg-background/80 backdrop-blur-md border-b border-white/10 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <h1 className="text-md font-bold tracking-tight text-text-primary">
                           <span className="font-serif-magic italic text-lg flow-text-gradient">{t('header_promptMagic')}</span> {t('header_forNanoBanana')}
                        </h1>
                    </div>
                     <nav ref={navRef} className="relative flex items-center gap-2 p-1 bg-surface rounded-full">
                        <div 
                            className="absolute bg-gradient-to-r from-blue-400 to-green-400 rounded-full shadow-lg transition-all duration-500 ease-in-out" 
                            style={highlightStyle}
                        />
                        <a ref={generateLinkRef} href="#" onClick={(e) => { e.preventDefault(); setAppState({screen: 'HOME'}); }} className={getLinkClass(isGenerateScreen)}>
                            <SparklesIcon className="w-5 h-5"/>
                            <span>{t('generate')}</span>
                        </a>
                        <a ref={ideasLinkRef} href="#" onClick={(e) => { e.preventDefault(); setAppState({ screen: 'PROMPT_IDEAS' }); }} className={getLinkClass(isIdeasScreen)}>
                            <ImageIcon className="w-5 h-5" />
                            <span>{t('promptIdeas')}</span>
                        </a>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;