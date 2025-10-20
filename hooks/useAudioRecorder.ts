import { useState, useRef, useCallback, useEffect } from 'react';

interface AudioRecorderHook {
  isRecording: boolean;
  isSupported: boolean;
  error: string | null;
  startRecording: () => void;
  stopRecording: () => Promise<Blob | null>;
  cancelRecording: () => void;
}

const useAudioRecorder = (): AudioRecorderHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder) {
        setIsSupported(true);
    }
  }, []);


  const startRecording = useCallback(async () => {
    if (!isSupported || isRecording) return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: 'audio/webm;codecs=opus' };
      const mediaRecorder = new MediaRecorder(stream, MediaRecorder.isTypeSupported(options.mimeType) ? options : undefined);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting audio recording:", err);
      if (err instanceof Error && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
          setError("micPermissionDenied");
      } else {
          setError("micCouldNotStart");
      }
    }
  }, [isSupported, isRecording]);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || !isRecording) {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        audioChunksRef.current = [];
        setIsRecording(false);
        
        // Stop all media tracks to turn off the mic indicator
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
        
        mediaRecorderRef.current = null;
        resolve(audioBlob);
      };

      mediaRecorderRef.current.stop();
    });
  }, [isRecording]);
  
  const cancelRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !isRecording) {
        return;
    }
    
    // Stop tracks to turn off mic indicator
    mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    
    // Stop recorder and clear chunks without resolving with a blob
    mediaRecorderRef.current.onstop = null; 
    mediaRecorderRef.current.stop();
    
    setIsRecording(false);
    audioChunksRef.current = [];
    mediaRecorderRef.current = null;
  }, [isRecording]);

  return { isRecording, isSupported, error, startRecording, stopRecording, cancelRecording };
};

export default useAudioRecorder;
