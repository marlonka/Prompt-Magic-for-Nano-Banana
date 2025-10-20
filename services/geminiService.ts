

import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (err) => {
      reject(err);
    };
    reader.readAsDataURL(blob);
  });
};

type ThoughtCallback = (thought: string) => void;
type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export const enhancePrompt = async (originalPrompt: string, onThoughtUpdate: ThoughtCallback, isEdit: boolean = false, baseImageBlob: Blob | null = null, promptImageBlobs: Blob[] = []): Promise<{ originalPrompt: string, magicPrompt: string, aspectRatio: AspectRatio }> => {
  const metaPromptEdit = `You are a world-class prompt engineer specializing in the Gemini 2.5 Flash Image model (Nano Banana). Your task is to take a user's simple, raw prompt, a primary image to be edited, and optional context/style images, and expand the prompt into a rich, descriptive instruction optimized for editing the primary image.

The primary image is the first image provided. The subsequent images (if present) are for context or style reference. Your enhanced prompt should be a clear instruction to the AI about what to change on the primary image and what to preserve.

---
**Best Practices to Follow:**

1.  **Be Hyper-Specific:** Instead of "add a hat," describe "add a dark grey fedora with a black ribbon, tilted slightly to the right."
2.  **Iterate and Refine:** Frame the prompt as a small, conversational change. For example, "That's great, but can you make the lighting a bit warmer?" or "Keep everything the same, but change the character's expression to be more serious."
3.  **Use "Semantic Negative Prompts":** Instead of saying "no cars," describe the desired scene positively, e.g., "an empty, deserted street with no signs of traffic."
4.  **Preserve Consistency:** If a character's features change undesirably, instruct the AI to revert to the original. "Revert the character's face to match the original photo, but keep the new armor."
5.  **Control the Camera:** Use photographic terms if the user implies a change in perspective, like "Change the perspective to a low-angle shot to make the subject look more heroic."

---
**Examples of Good Transformations:**

*   **User's Prompt:** "turn this into a funko pop"
*   **Your Enhanced Prompt:** "Create a detailed 3D render of a chibi Funko Pop figure, strictly based on the provided reference photo. The figure should accurately reflect the person's appearance, hairstyle, and attire. Use studio lighting and photorealistic textures against a pure white background."

*   **User's Prompt:** "make it ghibli style"
*   **Your Enhanced Prompt:** "Redraw this photo in the style of a Studio Ghibli animation. The scene should have soft, painterly backgrounds, expressive characters with rosy cheeks, and a warm, nostalgic color palette. Preserve the original composition."

*   **User's Prompt:** "change the weather"
*   **Your Enhanced Prompt:** "Transform the weather in this photo. Change the sunny day to a dramatic, rainy night, complete with realistic water puddles reflecting neon streetlights, and a moody, cinematic atmosphere. Keep all subjects and buildings the same."

---
**Your Task:**

-   Analyze the user's raw prompt and the provided image(s).
-   Apply the best practices and examples above.
-   Remove filler words ("um," "like," "can you make").
-   Your output MUST be ONLY the enhanced prompt string. Do not add any other text, greetings, or explanations.

**User's raw prompt:** "${originalPrompt}"`;
  
  const metaPromptGenerate = `You are a world-class prompt engineer and creative director specializing in the Gemini 2.5 Flash Image model (Nano Banana). Your task is to take a user's simple, raw prompt and transform it into a rich, descriptive "magic prompt" and determine the optimal aspect ratio for the scene.

---
**Best Practices to Follow:**

1.  **Be Hyper-Specific:** The more detail you provide, the more control you have. Instead of "fantasy armor," describe it as "ornate elven plate armor, etched with silver leaf patterns, with a high collar and pauldrons shaped like falcon wings."
2.  **Provide Context and Intent:** Explain the *purpose* of the image. For example, "Create a logo for a high-end, minimalist skincare brand" will yield better results than just "Create a logo."
3.  **Control the Camera:** Use photographic and cinematic language. Terms like \`wide-angle shot\`, \`macro shot\`, \`low-angle perspective\`, \`85mm portrait lens\`, and \`Dutch angle\` give you precise control.
4.  **Weave, Don't List:** Do not just list keywords. Weave details into a narrative description of the scene.
5.  **Remove Fluff:** Remove conversational filler like "um," "like," "can you make a picture of." Get straight to the descriptive prompt.

---
**Examples of Good Transformations:**

*   **User's Prompt:** "a lion made of paper"
*   **Resulting JSON:**
    {
      "magicPrompt": "A majestic lion, its entire body made of intricately folded orange and yellow origami paper. It stands proudly in a dense jungle of green papercraft trees and flowers. The scene is captured with a macro lens, revealing the delicate folds and textures of the paper. Soft, diffused lighting from the side casts gentle shadows, giving the scene a sense of depth and realism. The composition is tight, focusing on the lion's determined expression.",
      "aspectRatio": "4:3"
    }

*   **User's Prompt:** "inside of a sports car"
*   **Resulting JSON:**
    {
      "magicPrompt": "A technical cutaway illustration of a modern high-performance sports car. One side reveals the intricate engine, suspension, and detailed interior, while the other side shows the sleek, glossy red exterior. The car is set against a clean, dark grey studio background with dramatic, focused lighting that highlights the contours of the bodywork and the complexity of the internal components. The image has the clean, precise look of a high-end automotive advertisement.",
      "aspectRatio": "16:9"
    }

*   **User's Prompt:** "a cute yarn doll"
*   **Resulting JSON:**
    {
      "magicPrompt": "A close-up photograph showcasing a hand-crocheted amigurumi yarn doll. The doll is a cute chibi character with vivid contrasting colors and rich details. It rests on a warm wooden tabletop with natural light streaming in from a window, creating a comfortable and intimate atmosphere.",
      "aspectRatio": "1:1"
    }

---
**Your Task:**

-   Analyze the user's raw prompt: "${originalPrompt}"
-   Apply the best practices and examples above to create a "magicPrompt" and determine the best "aspectRatio".
-   The "aspectRatio" MUST be one of: "1:1", "3:4", "4:3", "9:16", "16:9".
-   Your response MUST be a single, valid JSON object with NO markdown formatting, comments, or other text outside the JSON structure.

The JSON object must have this exact structure:
{
  "magicPrompt": "<The full, detailed, enhanced prompt as a string>",
  "aspectRatio": "<A string representing the best aspect ratio>"
}`;

  const metaPrompt = isEdit ? metaPromptEdit : metaPromptGenerate;

  const textPart = { text: metaPrompt };
  const parts: any[] = [];

  if (baseImageBlob) {
      const imageBase64 = await blobToBase64(baseImageBlob);
      parts.push({
          inlineData: {
              mimeType: baseImageBlob.type,
              data: imageBase64
          }
      });
  }
  for (const promptImageBlob of promptImageBlobs) {
    if (promptImageBlob) {
        const imageBase64 = await blobToBase64(promptImageBlob);
        parts.push({
            inlineData: {
                mimeType: promptImageBlob.type,
                data: imageBase64
            }
        });
    }
  }
  parts.push(textPart);


  const responseStream = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: { parts: parts },
    config: {
        thinkingConfig: {
            includeThoughts: true,
        }
    }
  });

  let responseText = "";
  for await (const chunk of responseStream) {
      for (const part of chunk.candidates?.[0]?.content?.parts ?? []) {
          if (part.thought && part.text) {
              onThoughtUpdate(part.text);
          } else if (part.text) {
              responseText += part.text;
          }
      }
  }

  if (isEdit) {
    return { originalPrompt, magicPrompt: responseText.trim(), aspectRatio: '1:1' };
  }

  try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON object found in response");
      const jsonString = jsonMatch[0];
      const result = JSON.parse(jsonString);
      
      const validAspectRatios: AspectRatio[] = ["1:1", "3:4", "4:3", "9:16", "16:9"];
      
      const magicPrompt = result.magicPrompt || '';
      let aspectRatio: AspectRatio = result.aspectRatio || '1:1';
      
      if (!validAspectRatios.includes(aspectRatio)) {
          console.warn(`Invalid aspect ratio received: ${aspectRatio}. Defaulting to 1:1.`);
          aspectRatio = '1:1';
      }

      if (!magicPrompt) {
           throw new Error("Parsed JSON but magicPrompt is missing.");
      }

      return { originalPrompt, magicPrompt: magicPrompt.trim(), aspectRatio };
  } catch (error) {
      console.error("Failed to parse enhanced prompt JSON, using full text as prompt.", error, `Response text was: "${responseText}"`);
      return { originalPrompt, magicPrompt: responseText.trim(), aspectRatio: '1:1' };
  }
};


export const transcribeAndEnhancePrompt = async (audioBlob: Blob, onThoughtUpdate: ThoughtCallback, isEdit: boolean = false, baseImageBlob: Blob | null = null, promptImageBlobs: Blob[] = []): Promise<{ originalPrompt: string, magicPrompt: string, aspectRatio: AspectRatio }> => {
  const audioBase64 = await blobToBase64(audioBlob);
  
  // A better prompt to get the user's intent directly from audio.
  const transcriptionPrompt = "Listen to the audio and determine the user's core instruction for creating or editing an image. Extract the key command and clean it up, removing any conversational filler words like 'um', 'uhm', 'like', 'can you make', etc. Return only the cleaned-up command.";

  const transcriptionResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
            { inlineData: { mimeType: audioBlob.type || 'audio/webm', data: audioBase64 } },
            { text: transcriptionPrompt }
        ]
      }
  });
  const originalPrompt = (transcriptionResponse.text || '').trim();

  if (!originalPrompt) {
    throw new Error("Transcription failed or audio was empty.");
  }

  return enhancePrompt(originalPrompt, onThoughtUpdate, isEdit, baseImageBlob, promptImageBlobs);
};

export const generateImage = async (prompt: string, aspectRatio: AspectRatio = '1:1'): Promise<string> => {
    // The gemini-2.5-flash-image model does not have a specific config for aspect ratio.
    // We include it in the prompt to guide the model.
    const fullPrompt = `${prompt} The desired aspect ratio is ${aspectRatio}.`;

    const responseStream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [
            { text: fullPrompt }
          ]
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    // FIX: The type from the Gemini API for inlineData has an optional data property, so the local type is updated to match.
    let finalImageData: { mimeType?: string; data?: string } | null = null;
    // The stream might contain text parts first, so we need to process all chunks
    // until we find the image data.
    for await (const chunk of responseStream) {
        for (const part of chunk.candidates?.[0]?.content?.parts ?? []) {
            if (part.inlineData) {
                finalImageData = part.inlineData;
            }
        }
    }

    // FIX: Use a default mimeType if not provided and ensure data exists.
    if (finalImageData?.data) {
        const mimeType = finalImageData.mimeType ?? 'image/png';
        return `data:${mimeType};base64,${finalImageData.data}`;
    }

    console.error("Image generation failed. No image data received in stream.");
    throw new Error("Image generation did not return an image.");
};

export const editImage = async (prompt: string, baseImageBlob: Blob, promptImageBlobs: Blob[] | null): Promise<string> => {
    const baseImageBase64 = await blobToBase64(baseImageBlob);
    
    const parts: any[] = [
      { inlineData: { mimeType: baseImageBlob.type, data: baseImageBase64 } }
    ];

    if (promptImageBlobs) {
        for (const promptImageBlob of promptImageBlobs) {
            const promptImageBase64 = await blobToBase64(promptImageBlob);
            parts.push({ inlineData: { mimeType: promptImageBlob.type, data: promptImageBase64 } });
        }
    }

    parts.push({ text: prompt });
    
    const responseStream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash-image",
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    // FIX: The type from the Gemini API for inlineData has an optional data property, so the local type is updated to match.
    let finalImageData: { mimeType?: string; data?: string } | null = null;
    // The stream might contain text parts first, so we need to process all chunks
    // until we find the image data.
    for await (const chunk of responseStream) {
        for (const part of chunk.candidates?.[0]?.content?.parts ?? []) {
            if (part.inlineData) {
                finalImageData = part.inlineData;
            }
        }
    }

    // FIX: Use a default mimeType if not provided and ensure data exists.
    if (finalImageData?.data) {
        const mimeType = finalImageData.mimeType ?? 'image/png';
        return `data:${mimeType};base64,${finalImageData.data}`;
    }

    console.error("Image editing failed. No image data received in stream.");
    throw new Error("Image editing did not return an image.");
};