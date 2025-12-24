
import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { generateSpellingList } from '../services/geminiService';
import { saveSpellingResult } from '../services/firestoreService';
import Spinner from './common/Spinner';
import { QUIZ_LENGTH } from '../constants';

type PracticeStatus = 'idle' | 'speaking' | 'listening' | 'feedback' | 'finished';

type SpeechRecognitionAlternative = { transcript: string };

type SpeechRecognitionEvent = {
  results: ArrayLike<{ [index: number]: SpeechRecognitionAlternative }>;
};

type SpeechRecognitionErrorEvent = {
  error: string;
};

type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const SpeechRecognitionClass =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;
const isSpeechSupported = Boolean(SpeechRecognitionClass && typeof window.speechSynthesis !== 'undefined');
const LISTENING_STATUS: PracticeStatus = 'listening';

export default function SpellingPracticeView() {
  const { parent, selectedChild, endSpellingPractice, refreshParentData } = useAppContext();
  const [words, setWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<PracticeStatus>('idle');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    setStatus('speaking');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      setStatus('idle');
      if (onEnd) onEnd();
    };
    window.speechSynthesis.speak(utterance);
  }, []);

  const startListening = useCallback(() => {
    if (!isSpeechSupported || !SpeechRecognitionClass || status === LISTENING_STATUS) return;
    
    const recognition = new (SpeechRecognitionClass as SpeechRecognitionConstructor)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setStatus(LISTENING_STATUS);
    recognition.onend = () => {
        if (status === LISTENING_STATUS) setStatus('idle');
    };
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setError('Sorry, I had trouble hearing you. Please try again.');
        setStatus('idle');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript.toLowerCase().replace(/[^a-z]/g, '');
      const correctWord = words[currentWordIndex].toLowerCase();
      
      setStatus('feedback');
      if (transcript === correctWord) {
        setFeedback('correct');
        setCorrectCount(c => c + 1);
        speak('Correct!', () => setTimeout(nextWord, 1000));
      } else {
        setFeedback('incorrect');
        speak(`Sorry, the word was ${correctWord}. Let's try the next one.`, () => setTimeout(nextWord, 1500));
      }
    };
    
    recognition.start();
  }, [status, words, currentWordIndex, speak]);

  const nextWord = () => {
    setFeedback(null);
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(i => i + 1);
      setStatus('idle');
    } else {
      setStatus('finished');
      saveResults();
    }
  };

  const saveResults = async () => {
    if (!selectedChild || !parent) return;
    const score = (correctCount / words.length) * 100;
    await saveSpellingResult(parent.id, selectedChild.id, { words, score });
    await refreshParentData(); // Refresh parent data to include new result
  };

  useEffect(() => {
    if (!isSpeechSupported) {
      setError("Sorry, your browser doesn't support the speech features needed for this practice.");
      setLoading(false);
      return;
    }
    const fetchWords = async () => {
      if (!selectedChild) return;
      try {
        const wordList = await generateSpellingList(selectedChild.gradeLevel, 'Medium');
        setWords(wordList);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWords();
  }, [selectedChild]);

  const renderStatusUI = () => {
    const currentWord = words[currentWordIndex];
    switch (status) {
      case 'listening':
        return <><div className="animate-pulse text-red-500">Listening...</div><p className="text-2xl mt-4">Spell the word: <span className="font-bold">{currentWord}</span></p></>;
      case 'speaking':
        return <div className="text-blue-500">Speaking...</div>;
      case 'feedback':
        return <div className={`text-5xl font-bold ${feedback === 'correct' ? 'text-green-500' : 'text-red-500'}`}>{feedback === 'correct' ? 'Correct!' : 'Incorrect'}</div>;
      case 'finished':
        const score = (correctCount / words.length) * 100;
        return (
          <div>
            <h2 className="text-4xl font-bold text-slate-800 mb-4">{score >= 80 ? "Great Job!" : "Good Try!"}</h2>
            <p className="text-6xl font-bold text-purple-500 mb-6">{Math.round(score)}%</p>
            <p className="text-lg text-slate-600 mb-8">You spelled {correctCount} out of {words.length} words correctly.</p>
            <button onClick={endSpellingPractice} className="bg-sky-500 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-sky-600">Done</button>
          </div>
        );
      default: // idle
        return (
          <div className="text-center">
            <p className="text-2xl mb-6">Word {currentWordIndex + 1} of {words.length}</p>
            <button onClick={() => speak(currentWord, () => setTimeout(startListening, 500))} className="bg-blue-500 text-white font-bold py-4 px-8 rounded-full text-xl mb-4 hover:bg-blue-600">Hear Word</button>
            <p className="text-slate-500">Click to hear the word, then spell it out loud.</p>
          </div>
        );
    }
  };

  if (loading) return <div className="text-center"><Spinner /><p className="mt-4">Getting your spelling words...</p></div>;
  if (error) return <div className="text-center bg-red-100 p-6 rounded-lg"><p className="text-xl text-red-700 font-bold">Oops!</p><p className="mt-2">{error}</p><button onClick={endSpellingPractice} className="mt-4 bg-sky-500 text-white font-bold py-2 px-4 rounded-lg">Back</button></div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg text-center min-h-[400px] flex flex-col justify-center items-center">
      {renderStatusUI()}
    </div>
  );
}
