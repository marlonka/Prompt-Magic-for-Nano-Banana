import React, { useRef, useState } from 'react';
import ImageIcon from './icons/ImageIcon';
import UploadIcon from './icons/UploadIcon';
import { useTranslations } from '../contexts/LanguageContext';
import { TranslationKey } from '../lib/translations';

interface PromptIdeasScreenProps {
    onPromptClick: (prompt: string) => void;
    onImagePromptSubmit: (prompt: string, file: File) => void;
}

const promptIdeaDetails = [
    { key: "collectibleActionFigure", type: "Image-to-Image" },
    { key: "foodExplosion", type: "Image-to-Image" },
    { key: "toyBrickMovieScene", type: "Image-to-Image" },
    { key: "claymationStyle", type: "Image-to-Image" },
    { key: "professionalHeadshot", type: "Image-to-Image" },
    { key: "handPuppetStyle", type: "Image-to-Image" },
    { key: "chibiYarnDoll", type: "Image-to-Image" },
    { key: "origamiWorld", type: "Text-to-Image" },
    { key: "miniaturePerson", type: "Image-to-Image" },
    { key: "sixteenBitVideoGameCharacter", type: "Image-to-Image" },
    { key: "weatherTransformation", type: "Image-to-Image" },
    { key: "internalStructureView", type: "Text-to-Image" },
    { key: "nostalgicAnimeStyle", type: "Image-to-Image" },
    { key: "collectibleVinylFigure", type: "Image-to-Image" },
    { key: "characterCapsule", type: "Image-to-Image" },
    { key: "casualSmartphoneSelfie", type: "Image-to-Image" },
    { key: "photoRestoration", type: "Image-to-Image" },
    { key: "changeCameraAngle", type: "Image-to-Image" },
    { key: "tenMinutesLater", type: "Image-to-Image" },
    { key: "lineArtToReality", type: "Image-to-Image" },
    { key: "aiInteriorDesign", type: "Image-to-Image" },
    { key: "anatomyIllustration", type: "Image-to-Image" },
    { key: "cinematicPortrait", type: "Image-to-Image" },
    { key: "bwStudioPortrait", type: "Image-to-Image" },
];


const PromptIdeasScreen: React.FC<PromptIdeasScreenProps> = ({ onPromptClick, onImagePromptSubmit }) => {
    const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslations();

    const promptIdeas = promptIdeaDetails.map(idea => ({
        ...idea,
        title: t(`promptIdeas_${idea.key}_title` as TranslationKey),
        prompt: t(`promptIdeas_${idea.key}_prompt` as TranslationKey),
    }));

    const handleCardClick = (idea: typeof promptIdeas[0]) => {
        if (idea.type === 'Image-to-Image') {
            setSelectedPrompt(idea.prompt);
            fileInputRef.current?.click();
        } else {
            onPromptClick(idea.prompt);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && selectedPrompt) {
            onImagePromptSubmit(selectedPrompt, file);
        }
        if (event.target) {
            event.target.value = ''; // Reset file input
        }
        setSelectedPrompt(null);
    };

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col items-center text-center mb-12">
                <h2 className="text-4xl font-bold tracking-tighter text-text-primary">{t('trendingPromptIdeas')}</h2>
                <p className="mt-2 max-w-2xl text-text-secondary">{t('promptIdeasDescription')}</p>
            </div>
            <section>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {promptIdeas.map((idea) => (
                        <div 
                            key={idea.key} 
                            onClick={() => handleCardClick(idea)} 
                            className="group cursor-pointer h-full flow-border prompt-card rounded-lg"
                        >
                            <div className="relative bg-surface p-4 rounded-lg flex flex-col justify-between h-full">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-text-primary pr-2">{idea.title}</h3>
                                        {idea.type === 'Image-to-Image' 
                                            ? <UploadIcon className="w-6 h-6 text-text-secondary flex-shrink-0" /> 
                                            : <ImageIcon className="w-6 h-6 text-text-secondary flex-shrink-0" />}
                                    </div>
                                    <p className="text-xs text-text-secondary mb-3">{t(idea.type === 'Image-to-Image' ? 'imageToImage' : 'textToImage')}</p>
                                    <p className="text-sm text-text-secondary line-clamp-4">{idea.prompt}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default PromptIdeasScreen;