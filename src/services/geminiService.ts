import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { Difficulty, Question } from '../types';
import { QUIZ_LENGTH } from '../constants';

const modelName = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let cachedModel: GenerativeModel | null = null;

const getModel = (): GenerativeModel => {
  if (!apiKey) {
    throw new Error('Gemini API key is missing. Set VITE_GEMINI_API_KEY in your environment.');
  }
  if (!cachedModel) {
    const client = new GoogleGenerativeAI(apiKey);
    cachedModel = client.getGenerativeModel({ model: modelName });
  }
  return cachedModel;
};

const parseJson = <T>(text: string): T => {
  try {
    const cleaned = text.replace(/```json|```/gi, '').trim();
    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.error('Failed to parse Gemini response:', error, text);
    throw new Error('Could not parse AI response.');
  }
};

const generateDailyActivityPrompt = (grade: string, difficulty: Difficulty) => `Generate a JSON object for a grade ${grade} student at ${difficulty} difficulty with the following shape:
{
  "mathQuestions": [
    { "question": "string", "answer": "string" } x ${QUIZ_LENGTH}
  ],
  "readingPassage": "string",
  "readingQuestions": [
    { "question": "string", "answer": "string" } x ${QUIZ_LENGTH}
  ]
}
- Make all content age appropriate and engaging.
- Keep answers concise but correct.
- Respond with valid minified JSON.`;

export const generateDailyActivityContent = async (
  grade: string,
  difficulty: Difficulty,
): Promise<{ mathQuestions: Question[]; readingPassage: string; readingQuestions: Question[] }> => {
  const model = getModel();
  const response = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: generateDailyActivityPrompt(grade, difficulty) }] }],
    generationConfig: { responseMimeType: 'application/json' },
  });
  const payload = parseJson<{ mathQuestions: Question[]; readingPassage: string; readingQuestions: Question[] }>(
    response.response.text(),
  );
  if (!payload.mathQuestions || !payload.readingPassage || !payload.readingQuestions) {
    throw new Error('Incomplete activity returned by Gemini.');
  }
  return payload;
};

export const generateSpellingList = async (grade: string, difficulty: Difficulty): Promise<string[]> => {
  const model = getModel();
  const response = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Provide a JSON array of ${QUIZ_LENGTH} spelling words for grade ${grade} at ${difficulty} difficulty. Respond with a flat array of lowercase strings.`,
          },
        ],
      },
    ],
    generationConfig: { responseMimeType: 'application/json' },
  });
  const words = parseJson<string[]>(response.response.text());
  if (!Array.isArray(words) || words.some((word) => typeof word !== 'string')) {
    throw new Error('Invalid spelling list returned by Gemini.');
  }
  return words;
};
