import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function getCoachResponse(messages: Message[], userContext: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      })),
      config: {
        systemInstruction: `You are FitTrack Quick Focus Coach, an AI assistant designed to help students improve focus using very short, quick exercises (2–5 minutes).
        
        User Context:
        ${userContext}

        🎯 GOAL:
        Help students who have very little time, feel distracted, or need an instant focus boost.

        ⚠️ RESPONSE FORMAT (STRICT):
        You MUST reply in 3 sections:
        
        ⚡ QUICK EXERCISE (2–5 MIN)
        - Suggest 1–2 fast exercises (no equipment).
        
        🧠 FOCUS RESET
        - Give 1 quick mental trick.
        
        🍎 QUICK BRAIN FOOD
        - Suggest 1–2 fast foods (Banana, Peanuts, Water).

        🧠 LOGIC RULES:
        - If time < 3 min → only 1 exercise.
        - If energy LOW → light movement + breathing.
        - If focus LOW → suggest distraction removal.
        - Keep everything super fast and practical.

        🗣️ STYLE RULES:
        - Keep total answer under 80 words.
        - Use very simple language.
        - No long explanations.
        - Action-focused (do this now).`,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't process that. Let's try again!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having a bit of trouble connecting to my brain right now. Check your internet or try again later!";
  }
}

export async function generateUIScreen(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Premium mobile app UI design for FitTrack Pro AI. ${prompt}. Dark theme, neon blue accents, glassmorphism, high-quality 3D icons, professional typography, modern and sleek.`,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
}

export async function generateExerciseDemo(exerciseName: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Professional AI fitness trainer demonstrating ${exerciseName} with perfect form. 
            Trainer: 25-year-old athletic male, lean muscular body, friendly look, wearing modern black and neon blue gym outfit.
            Environment: Premium, clean gym with cinematic lighting and a slight glow.
            Visual Style: Ultra-realistic, focus on muscle movement and posture.
            Composition: 3-4 frames showing:
            1. Start Position: Correct posture with label "Start Position" and text "Control movement".
            2. Mid Movement: Body alignment shown clearly.
            3. Finish Position: Full contraction with label "Finish Position" and text "Keep back straight".
            Format: Vertical mobile app ready, clean margins.`,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Exercise Demo Generation Error:", error);
    return null;
  }
}
