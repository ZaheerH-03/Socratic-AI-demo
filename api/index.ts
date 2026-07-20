import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API Client
const apiKey = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const ai = apiKey
  ? new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      timeout: 8000,
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  })
  : null;

// Helper to execute Gemini requests with automatic fallback across Flash models if high demand (503) occurs
async function generateGeminiContent(aiClient: GoogleGenAI, params: any) {
  const modelsToTry = Array.from(new Set([
    GEMINI_MODEL,
    "gemini-3.5-flash",
    "gemini-3-flash-preview",
    "gemini-3.1-flash-lite",
    "gemma-4-26b-a4b-it",
    "gemma-4-31b-it",
    "gemini-2.0-flash",
    "gemini-1.5-flash"
  ]));
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      return await aiClient.models.generateContent({
        ...params,
        model: modelName,
      });
    } catch (err: any) {
      console.warn(`Gemini model ${modelName} failed or unavailable:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError;
}

// Initialize Ollama configuration
const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:7b";
const OLLAMA_NUM_GPU = process.env.OLLAMA_NUM_GPU !== undefined ? parseInt(process.env.OLLAMA_NUM_GPU, 10) : undefined;

// Determine whether to use Ollama fallback
const USE_OLLAMA = process.env.USE_OLLAMA === "true" || !apiKey;

// Helper to make request to Ollama
async function callOllama(messages: { role: string; content: string }[], schema?: any, temperature: number = 0.8) {
  const url = `${OLLAMA_HOST}/api/chat`;
  const options: any = {
    temperature: temperature,
  };

  if (OLLAMA_NUM_GPU !== undefined && !isNaN(OLLAMA_NUM_GPU)) {
    options.num_gpu = OLLAMA_NUM_GPU;
  }

  const body: any = {
    model: OLLAMA_MODEL,
    messages: messages,
    stream: false,
    options: options,
  };

  if (schema) {
    body.format = schema;
  } else {
    body.format = "json";
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return result.message?.content || "";
}

// Robust JSON extraction and parsing utility
function extractAndParseJSON(text: string): any {
  let cleaned = text.trim();
  // Remove markdown code fences if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  cleaned = cleaned.trim();

  // Try direct parsing first
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Attempt block recovery
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonCandidate = cleaned.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(jsonCandidate);
      } catch (innerError) {
        console.error("Failed to parse extracted JSON block:", jsonCandidate, innerError);
      }
    }
    throw new Error(`Failed to parse response as JSON: ${text}`);
  }
}

// Socratic AI system prompt template (Original: includes turn count and trap state directly for Gemini)
const getSystemPromptGemini = (topic: string, level: string, turnCount: number, trapSprung: boolean) => {
  return `You are "Professor Socratic AI," a rigorous, brilliant, and demanding university professor conducting an oral examination on the topic: "${topic}".
The student's claimed level of expertise is: "${level}".
You are currently on turn ${turnCount} of a 10-turn dialogue.

OPERATIONAL LAWS:
1. NEVER GIVE DIRECT ANSWERS. If the student asks you to explain something, ask them what they already know about it first, or give them a highly simplified, foundational premise and ask them to expand on it. Never spoon-feed information.
2. ADAPTIVE SOCRATIC METHOD: Your absolute goal is to find the bounds and limits of the student's knowledge.
   - If they answer correctly, challenge them with a deeper, more advanced follow-up question ("Why?", "What is the underlying mechanism?", "What if condition X changed?", "How would you justify this mathematically or conceptually?").
   - If they struggle, gently lower the difficulty slightly or offer a guide in the form of a leading question or hint, but never give the answer.
3. THE MISCONCEPTION TRAP: Once per session (and only once), you must introduce a subtle, common logical fallacy, scientific misconception, or incorrect premise in your reasoning.
   - If the trap has NOT been sprung yet (trapSprung = false) and you are between turns 3 and 7, you SHOULD actively try to spring the trap in this response.
   - When springing the trap, state a flawed scientific or logical argument as if it were a solid fact. See if the student detects it.
   - If the student blindly agrees with your flawed reasoning, let it slide for one turn, then firmly point out the flaw, explain how they fell for the trap, and demand they correct it.
   - If they spot the fallacy/trap, congratulate them with rigorous academic pride and move to a more advanced line of questioning.
4. DEMEANOR: Act like a scholarly, fair, highly analytical, but demanding professor in their private study. Use academic terminology appropriate to their level (${level}). Speak with gravitas and elegant prose. Do not use modern slang or emojis. Keep responses concise but academically rich (around 2-4 sentences max).

CURRENT SESSION STATUS:
- Topic: ${topic}
- Student Expertise: ${level}
- Turn Count: ${turnCount}/10
- Has Trap Been Sprung Previously? ${trapSprung ? "Yes" : "No"}`;
};

// Socratic AI system prompt template (Optimized: Static across turns for Ollama prompt caching)
const getSystemPrompt = (topic: string, level: string) => {
  return `You are "Professor Socratic AI," a rigorous, brilliant, and demanding university professor conducting an oral examination on the topic: "${topic}".
The student's claimed level of expertise is: "${level}".

OPERATIONAL LAWS:
1. NEVER GIVE DIRECT ANSWERS. If the student asks you to explain something, ask them what they already know about it first, or give them a highly simplified, foundational premise and ask them to expand on it. Never spoon-feed information.
2. ADAPTIVE SOCRATIC METHOD: Your absolute goal is to find the bounds and limits of the student's knowledge.
   - If they answer correctly, challenge them with a deeper, more advanced follow-up question ("Why?", "What is the underlying mechanism?", "What if condition X changed?", "How would you justify this mathematically or conceptually?").
   - If they struggle, gently lower the difficulty slightly or offer a guide in the form of a leading question or hint, but never give the answer.
3. THE MISCONCEPTION TRAP: Once per session (and only once), you must introduce a subtle, common logical fallacy, scientific misconception, or incorrect premise in your reasoning.
   - If the trap has NOT been sprung yet and you are between turns 3 and 7, you SHOULD actively try to spring the trap in this response.
   - When springing the trap, state a flawed scientific or logical argument as if it were a solid fact. See if the student detects it.
   - If the student blindly agrees with your flawed reasoning, let it slide for one turn, then firmly point out the flaw, explain how they fell for the trap, and demand they correct it.
   - If they spot the fallacy/trap, congratulate them with rigorous academic pride and move to a more advanced line of questioning.
4. DEMEANOR: Act like a scholarly, fair, highly analytical, but demanding professor in their private study. Use academic terminology appropriate to their level (${level}). Speak with gravitas and elegant prose. Do not use modern slang or emojis. Keep responses concise but academically rich (around 2-4 sentences max).`;
};

// Response schemas for Ollama JSON formatting
const chatResponseSchema = {
  type: "object",
  properties: {
    professorMessage: {
      type: "string",
    },
    professorStatus: {
      type: "string",
      enum: ["Pensive", "Skeptical", "Demanding", "Impressed", "Trap Set", "Intrigued", "Disappointed"],
    },
    trapActive: {
      type: "boolean",
    },
    trapExplanation: {
      type: "string",
    },
  },
  required: ["professorMessage", "professorStatus", "trapActive"],
};

const reportResponseSchema = {
  type: "object",
  properties: {
    conceptualStrengths: {
      type: "array",
      items: { type: "string" },
    },
    knowledgeGaps: {
      type: "array",
      items: { type: "string" },
    },
    grade: {
      type: "string",
      enum: ["Fails", "Passes", "Meets Expectations", "Exceeds Expectations"],
    },
    professorEvaluation: {
      type: "string",
    },
    conceptScores: {
      type: "array",
      items: {
        type: "object",
        properties: {
          concept: { type: "string" },
          score: { type: "integer" },
        },
        required: ["concept", "score"],
      },
    },
    trapResponse: {
      type: "string",
    },
  },
  required: ["conceptualStrengths", "knowledgeGaps", "grade", "professorEvaluation", "conceptScores", "trapResponse"],
};

// API: Handle chat turns
app.post("/api/chat", async (req, res) => {
  try {
    const { topic, level, messages, turnCount, trapSprung } = req.body;

    if (!topic || !level || !messages) {
      return res.status(400).json({ error: "Missing required fields: topic, level, messages" });
    }

    const currentTurn = turnCount || 1;

    if (!USE_OLLAMA) {
      // GEMINI FLOW
      if (!ai) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not set." });
      }

      const apiMessages = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const response = await generateGeminiContent(ai, {
        contents: apiMessages,
        config: {
          systemInstruction: getSystemPromptGemini(topic, level, currentTurn, trapSprung),
          temperature: 0.8,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              professorMessage: {
                type: Type.STRING,
                description: "The professor's Socratic dialogue message. Must follow all Socratic laws.",
              },
              professorStatus: {
                type: Type.STRING,
                description: "The professor's emotional/cognitive state. Must be one of: 'Pensive', 'Skeptical', 'Demanding', 'Impressed', 'Trap Set', 'Intrigued', 'Disappointed'",
              },
              trapActive: {
                type: Type.BOOLEAN,
                description: "Set to true ONLY if you are actively introducing a logical fallacy, scientific misconception, or incorrect premise in this specific response to test the student.",
              },
              trapExplanation: {
                type: Type.STRING,
                description: "If trapActive is true, a brief internal note explaining the fallacy or misconception you introduced. If trapActive is false, keep empty.",
              },
            },
            required: ["professorMessage", "professorStatus", "trapActive"],
          },
        },
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("No response received from Gemini.");
      }

      const data = JSON.parse(resultText);
      res.json(data);
    } else {
      // OLLAMA FLOW
      const ollamaMessages = [
        {
          role: "system",
          content: getSystemPrompt(topic, level),
        },
      ];

      for (const m of messages) {
        ollamaMessages.push({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        });
      }

      // Append turn context as a system prompt at the end to keep base prompt static
      ollamaMessages.push({
        role: "system",
        content: `[System Instruction: Current Turn: ${currentTurn}/10. Has Trap Been Sprung Previously? ${trapSprung ? "Yes" : "No"}]`,
      });

      const responseText = await callOllama(ollamaMessages, chatResponseSchema, 0.8);
      if (!responseText) {
        throw new Error("No response received from Ollama.");
      }

      const data = extractAndParseJSON(responseText);
      res.json(data);
    }
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: error.message || "An error occurred during Socratic processing." });
  }
});

// API: Generate structured final Mastery Report
app.post("/api/report", async (req, res) => {
  try {
    const { topic, level, messages } = req.body;

    if (!topic || !level || !messages) {
      return res.status(400).json({ error: "Missing required fields for report creation" });
    }

    const reportPrompt = `Subject: "${topic}"
Expertise level requested: "${level}"

Here is the complete transcript of the Socratic dialogue between Professor Socratic AI and the student:
${JSON.stringify(messages, null, 2)}

Based on this dialogue, construct a detailed academic Mastery Report.

You must output a JSON object adhering to the specified schema:
1. "conceptualStrengths": A list of 2-4 concrete concepts, theorems, or lines of reasoning the student demonstrated solid grasp or mastery of.
2. "knowledgeGaps": A list of 2-4 concrete concepts, details, or underlying mechanisms where the student stumbled, lacked depth, or failed to provide rigour.
3. "grade": A final evaluation grade, which MUST be exactly one of: "Fails", "Passes", "Meets Expectations", "Exceeds Expectations".
4. "professorEvaluation": A formal academic letter from the Professor's desk evaluating their mindset, rigour, and intellectual flexibility.
5. "conceptScores": A list of 4 key sub-topics/dimensions relevant to "${topic}" with score integers from 0 to 100 representing the user's mastery.
6. "trapResponse": A targeted review of how the user handled the Misconception Trap. Did they identify the fallacy/misconception, or did they agree blindly? Give specific context from the transcript.`;

    if (!USE_OLLAMA) {
      // GEMINI FLOW
      if (!ai) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not set." });
      }

      const response = await generateGeminiContent(ai, {
        contents: reportPrompt,
        config: {
          temperature: 0.5,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              conceptualStrengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Detailed bullet points of the student's accurate knowledge areas.",
              },
              knowledgeGaps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Detailed bullet points of gaps or misconceptions spotted in their answers.",
              },
              grade: {
                type: Type.STRING,
                description: "Exactly one of: 'Fails', 'Passes', 'Meets Expectations', 'Exceeds Expectations'.",
              },
              professorEvaluation: {
                type: Type.STRING,
                description: "A formal, scholarly, constructive, and demanding evaluation written in-character.",
              },
              conceptScores: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    concept: { type: Type.STRING, description: "The sub-topic or skill tested" },
                    score: { type: Type.INTEGER, description: "Score from 0 to 100" },
                  },
                  required: ["concept", "score"],
                },
                description: "List of 4 key sub-concepts tested during the exam.",
              },
              trapResponse: {
                type: Type.STRING,
                description: "A scholarly critique of how they handled the logical trap or misconception.",
              },
            },
            required: [
              "conceptualStrengths",
              "knowledgeGaps",
              "grade",
              "professorEvaluation",
              "conceptScores",
              "trapResponse",
            ],
          },
        },
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("No response received from Gemini for report generation.");
      }

      const data = JSON.parse(resultText);
      res.json(data);
    } else {
      // OLLAMA FLOW
      const ollamaMessages = [
        {
          role: "system",
          content: "You are the Examination Board reviewing the student's performance on the oral exam.",
        },
        {
          role: "user",
          content: reportPrompt,
        },
      ];

      const responseText = await callOllama(ollamaMessages, reportResponseSchema, 0.5);
      if (!responseText) {
        throw new Error("No response received from Ollama for report generation.");
      }

      const data = extractAndParseJSON(responseText);
      res.json(data);
    }
  } catch (error: any) {
    console.error("Error in /api/report:", error);
    res.status(500).json({ error: error.message || "An error occurred during report compilation." });
  }
});

// Serve frontend and setup Vite dev server in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, {
      maxAge: '1d',
      etag: true,
    }));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (process.env.VERCEL !== "1") {
  startServer();
}

export default app;
