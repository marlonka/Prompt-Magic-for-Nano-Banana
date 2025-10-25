
<div align="center">
Done with <br>
  <img alt="Prompt Magic for Nano Banana" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" width="1200" height="475" />
</div>

# Prompt Magic for Nano Banana

"Prompt Magic for Nano Banana" is a web application that allows you to generate images from voice or text prompts. It uses the Gemini API to understand your voice, enhance your prompts, and generate high-quality images. You can also upload your own images and edit them with voice or text prompts.

![image](https://raw.githubusercontent.com/marlonka/Prompt-Magic-for-Nano-Banana/af2ff73c0e1f7a0b943ab1297300188e6888bef8/nanobananamagic2610.jpg)

## How to Use

1. **Speak or type your idea:**
   - Click the microphone icon to speak your idea.
   - Or, type your idea in the text box.
2. **Generate an image:**
   - Click the "Generate" button to create a new image.
3. **View and edit the image:**
   - The generated image will be displayed on the screen.
   - You can then edit the image by speaking or typing a new prompt.
4. **Start over:**
   - Click the "Reset" button to start over.

## Run Locally

**Prerequisites:** Node.js

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Set up your environment variables:**
   - Create a new file named `.env.local` in the root of the project.
   - Add the following line to the file:
     ```
     GEMINI_API_KEY=YOUR_API_KEY
     ```
   - Replace `YOUR_API_KEY` with your Gemini API key.
3. **Run the app:**
   ```bash
   npm run dev
   ```
4. **Open the app in your browser:**
   - Go to `http://localhost:3000` to view the app.

## Deploy

For information on how to deploy your app, see the [deployment documentation](https://ai.google.dev/docs/ai-studio-deploys).
