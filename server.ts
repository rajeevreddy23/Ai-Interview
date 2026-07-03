import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('WARNING: GEMINI_API_KEY is not set. Gemini API calls will fail.');
}

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.use(express.json());

// API Route: Start an interview and get the initial question
app.post('/api/interview/start', async (req, res) => {
  try {
    const { role, level, interviewType, customRole, avatar } = req.body;
    const targetRole = role === 'custom' ? customRole || 'Custom Candidate' : role;
    const interviewerName = avatar?.name || 'MockMind AI';
    const interviewerStyle = avatar?.personalityStyle || 'Speak in a highly realistic, conversational, and professional tone.';

    const systemInstruction = `You are ${interviewerName}, an elite AI interviewer conducting a highly realistic mock interview for a ${level} level ${targetRole} candidate.
The focus of this interview is: ${interviewType}.

Your personality & style:
${interviewerStyle}
- Keep your introduction extremely brief, friendly, and encouraging.
- State the context of the interview and immediately ask exactly ONE clear, focused first question to begin.
- Do NOT include any formatting like JSON, markdown headings, or meta-talk. Just output your natural opening greeting and the first question.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Introduce yourself as ${interviewerName} and ask the first question for a ${level} level ${targetRole} candidate under a ${interviewType} interview. Let's begin.`,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Error in /api/interview/start:', error);
    res.status(500).json({ error: error.message || 'Failed to start the interview.' });
  }
});

// API Route: Process user's answer, score it silently, and get follow-up
app.post('/api/interview/answer', async (req, res) => {
  try {
    const { role, level, interviewType, customRole, history, answer, avatar } = req.body;
    const targetRole = role === 'custom' ? customRole || 'Custom Candidate' : role;
    const interviewerName = avatar?.name || 'MockMind AI';
    const interviewerStyle = avatar?.personalityStyle || 'Speak in a highly realistic, conversational, and professional tone.';

    const systemInstruction = `You are ${interviewerName}, an elite AI interviewer conducting a mock interview for a ${level} level ${targetRole} candidate (Focus: ${interviewType}).
Your task is to analyze the candidate's latest response, evaluate it silently in the background, and ask the next natural follow-up or transition question.

Guidelines:
- React naturally and conversationally to the candidate's answer before posing the next question, incorporating your distinct style: ${interviewerStyle}
- Ask a natural, contextual follow-up question or pivot gracefully to the next related question in the sequence.
- Do NOT ask multiple questions at once. Ask exactly ONE clear question.
- Perform a detailed background evaluation of the latest response, scoring them out of 10 across clarity, correctness, depth, and structure.
- You must structure your entire output strictly in JSON format matching the schema provided. Do not enclose it in extra markdown blocks outside of the direct JSON.`;

    const contents = [
      ...history.map((msg: any) => ({
        role: msg.sender === 'interviewer' ? 'model' : 'user',
        parts: [{ text: msg.text }],
      })),
      {
        role: 'user',
        parts: [{ text: `My answer: "${answer}"` }],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.6,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            followUp: {
              type: Type.STRING,
              description: "The interviewer's next natural spoken response followed by the next single interview question to ask.",
            },
            score: {
              type: Type.OBJECT,
              properties: {
                clarity: { type: Type.INTEGER, description: 'Communication clarity, articulation, and vocabulary selection from 1 to 10.' },
                correctness: { type: Type.INTEGER, description: 'Technical, theoretical, or logical correctness of the response from 1 to 10.' },
                depth: { type: Type.INTEGER, description: 'Completeness, usage of real examples, metrics, or detailed reasoning from 1 to 10.' },
                structure: { type: Type.INTEGER, description: 'Organization, flow, and structured storytelling (e.g. STAR method) from 1 to 10.' },
              },
              required: ['clarity', 'correctness', 'depth', 'structure'],
            },
            evaluation: {
              type: Type.STRING,
              description: 'A brief 1-2 sentence professional and objective summary evaluating this specific answer\'s merits.',
            },
            feedback: {
              type: Type.STRING,
              description: 'Constructive suggestions pointing out specific aspects that would make this answer stronger.',
            },
          },
          required: ['followUp', 'score', 'evaluation', 'feedback'],
        },
      },
    });

    const parsedResponse = JSON.parse(response.text || '{}');
    res.json(parsedResponse);
  } catch (error: any) {
    console.error('Error in /api/interview/answer:', error);
    res.status(500).json({ error: error.message || 'Failed to process answer.' });
  }
});

// API Route: Generate comprehensive final feedback report
app.post('/api/interview/report', async (req, res) => {
  try {
    const { role, level, interviewType, customRole, history, scores } = req.body;
    const targetRole = role === 'custom' ? customRole || 'Custom Candidate' : role;

    const systemInstruction = `You are an elite, expert talent acquisition coach and interviewer.
Your task is to compile a highly constructive, detailed, and visually polished Final Interview Performance Report for a ${level} level ${targetRole} candidate who completed a ${interviewType} mock interview.

Analyze the entire conversation logs and the score metrics accumulated for each question.
Create a beautifully structured response matching the specified JSON schema.
Ensure your feedback is insightful, actionable, and free from platitudes. Calculate an authentic overallScore out of 100 based on the average scores.`;

    const promptText = `Please compile a performance report based on the following mock interview session:
Role: ${level} ${targetRole}
Interview Focus: ${interviewType}

Intermediate Scores:
${JSON.stringify(scores, null, 2)}

Complete Conversation Logs:
${JSON.stringify(history, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.5,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: {
              type: Type.INTEGER,
              description: 'Cumulative performance score from 0 to 100 based on all responses.',
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'At least 3 distinct overall candidate strengths observed in the responses.',
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'At least 3 key weakness points or specific topics the candidate struggled with.',
            },
            improvementTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Actionable, concrete preparation tips or resource pathways to level up.',
            },
            detailedFeedback: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionNumber: { type: Type.INTEGER, description: '1-based index of the interview question.' },
                  question: { type: Type.STRING, description: 'The interview question asked.' },
                  answer: { type: Type.STRING, description: 'The user\'s corresponding answer.' },
                  overallAnswerScore: { type: Type.INTEGER, description: 'A composite percentage score for this specific answer from 0 to 100.' },
                  strengths: { type: Type.STRING, description: 'A high-impact sentence summarizing what was answered well.' },
                  improvements: { type: Type.STRING, description: 'Specific and precise suggestions for making this answer stronger.' },
                },
                required: ['questionNumber', 'question', 'answer', 'overallAnswerScore', 'strengths', 'improvements'],
              },
              description: 'Detailed analysis for each question-answer pair in the interview.',
            },
          },
          required: ['overallScore', 'strengths', 'weaknesses', 'improvementTips', 'detailedFeedback'],
        },
      },
    });

    const parsedReport = JSON.parse(response.text || '{}');
    res.json(parsedReport);
  } catch (error: any) {
    console.error('Error in /api/interview/report:', error);
    res.status(500).json({ error: error.message || 'Failed to generate report.' });
  }
});

// Configure Vite middleware in development or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
