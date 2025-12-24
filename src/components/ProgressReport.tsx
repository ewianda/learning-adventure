
import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { getChildProgress, gradeActivity, getSpellingProgress } from '../services/firestoreService';
import { DailyActivity, SpellingResult } from '../types';
import Spinner from './common/Spinner';
import { Avatar } from '../constants';

// GradingForm remains the same as it's for Daily Activities
const GradingForm = ({ activity, onGrade, onCancel }: { activity: DailyActivity, onGrade: (mathCorrect: number, readingCorrect: number) => Promise<void>, onCancel: () => void }) => {
  const [mathCorrect, setMathCorrect] = useState(0);
  const [readingCorrect, setReadingCorrect] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onGrade(mathCorrect, readingCorrect);
    setIsSubmitting(false);
  };

  return (
    <div className="bg-sky-50 p-6 rounded-xl border-2 border-sky-200">
      <h3 className="font-bold text-2xl mb-4 text-slate-800">Grade Activity for {new Date(activity.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })}</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="math-score" className="block font-bold text-slate-600 mb-2">Math: Correct Answers (out of {activity.mathQuestions.length})</label>
            <input id="math-score" type="number" min="0" max={activity.mathQuestions.length} value={mathCorrect} onChange={e => setMathCorrect(parseInt(e.target.value, 10) || 0)} className="w-full p-2 rounded-lg border" required />
          </div>
          <div>
            <label htmlFor="reading-score" className="block font-bold text-slate-600 mb-2">Reading: Correct Answers (out of {activity.readingQuestions.length})</label>
            <input id="reading-score" type="number" min="0" max={activity.readingQuestions.length} value={readingCorrect} onChange={e => setReadingCorrect(parseInt(e.target.value, 10) || 0)} className="w-full p-2 rounded-lg border" required />
          </div>
        </div>
        <div className="flex gap-4">
          <button type="submit" disabled={isSubmitting} className="flex-1 bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400">{isSubmitting ? 'Submitting...' : 'Submit Grade'}</button>
          <button type="button" onClick={onCancel} className="flex-1 bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600">Cancel</button>
        </div>
      </form>
      <div className="mt-8 max-h-96 overflow-y-auto pr-2">
        <h4 className="font-bold text-xl text-sky-700 mb-3">Math Questions & Answers</h4>
        <ol className="list-decimal list-inside space-y-3 text-sm">{activity.mathQuestions.map((q, i) => <li key={`math-ans-${i}`}><span className="font-semibold">{q.question}</span> <br/> <span className="text-green-700">Answer: {q.answer}</span></li>)}</ol>
        <h4 className="font-bold text-xl text-emerald-700 mt-6 mb-3">Reading Questions & Answers</h4>
        <ol className="list-decimal list-inside space-y-3 text-sm">{activity.readingQuestions.map((q, i) => <li key={`read-ans-${i}`}><span className="font-semibold">{q.question}</span> <br/> <span className="text-green-700">Answer: {q.answer}</span></li>)}</ol>
      </div>
    </div>
  );
};

type ProgressTab = 'daily' | 'spelling';

export default function ProgressReport() {
  const { parent, viewingProgressFor, exitProgressView } = useAppContext();
  const [dailyActivities, setDailyActivities] = useState<DailyActivity[]>([]);
  const [spellingProgress, setSpellingProgress] = useState<SpellingResult[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<DailyActivity | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProgressTab>('daily');

  const fetchProgress = useCallback(async () => {
    if (!viewingProgressFor) return;
    setLoading(true);
    const [dailyData, spellingData] = await Promise.all([
        getChildProgress(viewingProgressFor.id),
        parent ? getSpellingProgress(parent.id, viewingProgressFor.id) : Promise.resolve<SpellingResult[]>([]),
    ]);
    setDailyActivities(dailyData);
    setSpellingProgress(spellingData);
    if (dailyData.length > 0 && !selectedActivity) {
      setSelectedActivity(dailyData[0]);
    }
    setLoading(false);
  }, [viewingProgressFor, selectedActivity]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const handleGradeSubmit = async (mathCorrect: number, readingCorrect: number) => {
    if (!selectedActivity) return;
    await gradeActivity(selectedActivity.id, mathCorrect, readingCorrect);
    setIsGrading(false);
    setSelectedActivity(null);
    fetchProgress();
  };

  if (!viewingProgressFor) return null;

  const renderDailyActivities = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1 bg-white p-4 rounded-2xl shadow-lg"><h3 className="font-bold text-lg mb-4 text-slate-700">Completed Days</h3><ul className="space-y-2">{dailyActivities.map(act => (<li key={act.id}><button onClick={() => { setSelectedActivity(act); setIsGrading(false); }} className={`w-full text-left p-3 rounded-lg transition-colors ${selectedActivity?.id === act.id && !isGrading ? 'bg-sky-500 text-white font-bold' : 'hover:bg-sky-100'}`}><div className="flex justify-between items-center"><span>{new Date(act.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', timeZone: 'UTC' })}</span>{act.status === 'graded' ? <span className="text-xs font-bold text-white bg-green-500 px-2 py-1 rounded-full">Graded</span> : <span className="text-xs font-bold text-white bg-amber-500 px-2 py-1 rounded-full">Ready to Grade</span>}</div></button></li>))}</ul></div>
      <div className="md:col-span-2">{isGrading ? <GradingForm activity={selectedActivity!} onGrade={handleGradeSubmit} onCancel={() => setIsGrading(false)} /> : selectedActivity ? <div className="bg-white p-6 rounded-2xl shadow-lg"><h3 className="font-bold text-2xl mb-4 text-slate-800">Activity for {new Date(selectedActivity.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</h3>{selectedActivity.status === 'graded' ? <div className="space-y-4"><div className="text-center bg-sky-100 p-4 rounded-lg"><p className="text-sky-800 font-bold">Math Score</p><p className="text-4xl font-bold text-sky-600">{Math.round(selectedActivity.score?.math ?? 0)}%</p></div><div className="text-center bg-emerald-100 p-4 rounded-lg"><p className="text-emerald-800 font-bold">Reading Score</p><p className="text-4xl font-bold text-emerald-600">{Math.round(selectedActivity.score?.reading ?? 0)}%</p></div><div className="text-center bg-slate-200 p-4 rounded-lg"><p className="text-slate-800 font-bold">Overall Score</p><p className="text-5xl font-extrabold text-slate-700">{Math.round(selectedActivity.score?.overall ?? 0)}%</p></div></div> : <div className="text-center"><p className="text-slate-600 mb-4">This activity is ready to be graded.</p><button onClick={() => setIsGrading(true)} className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600">Grade Activity</button></div>}</div> : <p>Select a date to see details.</p>}</div>
    </div>
  );

  const renderSpellingProgress = () => (
    <div className="bg-white p-6 rounded-2xl shadow-lg max-h-[70vh] overflow-y-auto">
        <h3 className="font-bold text-2xl mb-4 text-slate-800">Spelling Test History</h3>
        {spellingProgress.length === 0 ? <p>No spelling tests completed yet.</p> : (
            <ul className="space-y-4">
                {spellingProgress.map(result => (
                    <li key={result.timestamp} className="border-b pb-4">
                        <div className="flex justify-between items-center">
                            <p className="font-bold text-slate-700">{new Date(result.timestamp).toLocaleString()}</p>
                            <p className={`text-2xl font-bold ${result.score >= 80 ? 'text-green-500' : 'text-amber-500'}`}>{Math.round(result.score)}%</p>
                        </div>
                        <p className="text-sm text-slate-500 mt-2">Words: {result.words.join(', ')}</p>
                    </li>
                ))}
            </ul>
        )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4"><Avatar name={viewingProgressFor.avatar} className="text-6xl" /><div><h2 className="text-4xl font-bold text-slate-800">{viewingProgressFor.name}'s Progress</h2><p className="text-xl text-slate-500">Review completed activities.</p></div></div>
        <button onClick={exitProgressView} className="bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600">Back to Dashboard</button>
      </div>
      <div className="mb-6 border-b-2 border-slate-200">
        <nav className="flex space-x-4">
            <button onClick={() => setActiveTab('daily')} className={`py-2 px-4 font-semibold ${activeTab === 'daily' ? 'border-b-4 border-sky-500 text-sky-600' : 'text-slate-500'}`}>Daily Activities</button>
            <button onClick={() => setActiveTab('spelling')} className={`py-2 px-4 font-semibold ${activeTab === 'spelling' ? 'border-b-4 border-purple-500 text-purple-600' : 'text-slate-500'}`}>Spelling Practice</button>
        </nav>
      </div>
      {loading ? <Spinner /> : (activeTab === 'daily' ? renderDailyActivities() : renderSpellingProgress())}
    </div>
  );
}
