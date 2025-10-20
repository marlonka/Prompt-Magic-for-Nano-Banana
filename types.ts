export type GeneratedImageData = {
  originalPrompt: string;
  magicPrompt: string;
  imageUrl: string;
  baseImageUrl: string | null; // The image that was edited, if any
};

export type EditImageData = {
  imageUrl: string;
}

export type AppState =
  | { screen: 'HOME', uploadedImages?: File[] }
  | { screen: 'PROMPT_IDEAS' }
  | { screen: 'GENERATING'; phase: 'enhance' | 'image' }
  | { screen: 'DISPLAY'; data: GeneratedImageData }
  | { screen: 'ERROR'; message: string };