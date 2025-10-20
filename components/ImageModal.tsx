import React, { useEffect, useState, useCallback } from 'react';
import XMarkIcon from './icons/XMarkIcon';

interface ImageModalProps {
    src: string;
    onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ src, onClose }) => {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(onClose, 300); // Match animation duration
    }, [onClose]);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleClose]);


    return (
        <div 
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm ${isClosing ? 'modal-exit' : 'modal-enter'}`}
            onClick={handleClose}
        >
             <div className="modal-content relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <img src={src} alt="Full screen preview" className="w-auto h-auto max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
                <button 
                    onClick={handleClose}
                    className="absolute -top-4 -right-4 h-10 w-10 flex items-center justify-center bg-surface rounded-full text-text-secondary hover:text-text-primary hover:scale-110 transition-transform"
                    aria-label="Close image preview"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default ImageModal;