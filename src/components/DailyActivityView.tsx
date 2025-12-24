
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { getDailyActivity, markActivityAsViewed } from '../services/firestoreService';
import { DailyActivity } from '../types';
import Spinner from './common/Spinner';

export default function DailyActivityView() {
  const { selectedChild, endActivity } = useAppContext();
  const [activity, setActivity] = useState<DailyActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedChild) return;
    const fetchActivity = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDailyActivity(selectedChild);
        setActivity(data);
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [selectedChild]);

  const handleDone = async () => {
    if (!activity || activity.status !== 'pending') return;
    setIsSubmitting(true);
    try {
      await markActivityAsViewed(activity.id);
      endActivity();
    } catch (err) {
      setError("Could not mark activity as done. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center"><Spinner /><p className="text-xl text-slate-600 mt-4">Preparing your daily adventure...</p></div>;
  }
  if (error) {
    return <div className="text-center bg-red-100 p-6 rounded-lg"><p className="text-xl text-red-700 font-bold">Oops!</p><p className="text-slate-600 mt-2">{error}</p><button onClick={endActivity} className="mt-4 bg-sky-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600">Back to Dashboard</button></div>;
  }
  if (!activity) return null;

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold text-slate-800 mb-2">Today's Activity</h2>
      <p className="text-slate-500 mb-8">Read the questions below and write your answers on a piece of paper. Number your answers clearly!</p>
      
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-sky-700 border-b-2 border-sky-200 pb-2 mb-4">Math Questions</h3>
        <ol className="list-decimal list-inside space-y-4 text-lg text-slate-700">
          {activity.mathQuestions.map((q, i) => <li key={`math-${i}`}>{q.question}</li>)}
        </ol>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-emerald-700 border-b-2 border-emerald-200 pb-2 mb-4">Reading Comprehension</h3>
        <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-200">
          <h4 className="font-bold text-xl mb-2 text-slate-600">The Story</h4>
          <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{activity.readingPassage}</p>
        </div>
        <h4 className="font-bold text-xl mb-4 text-slate-600">Reading Questions</h4>
        <ol className="list-decimal list-inside space-y-4 text-lg text-slate-700">
          {activity.readingQuestions.map((q, i) => <li key={`read-${i}`}>{q.question}</li>)}
        </ol>
      </div>

      <div className="mt-12 text-center">
        <button 
          onClick={handleDone}
          disabled={isSubmitting || activity.status !== 'pending'}
          className="bg-green-500 text-white font-black text-2xl py-4 px-10 rounded-xl hover:bg-green-600 transition-transform transform hover:scale-105 nunito-black disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : activity.status !== 'pending' ? "Completed!" : "I'm Done!"}
        </button>
        {activity.status !== 'pending' && <p className="text-slate-500 mt-2">You've already completed this activity for today!</p>}
      </div>
    </div>
  );
}
