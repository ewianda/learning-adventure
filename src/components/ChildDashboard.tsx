
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Avatar, SpellingIcon } from '../constants';

export default function ChildDashboard() {
  const { selectedChild, unselectChild, startActivity, startSpellingPractice } = useAppContext();

  if (!selectedChild) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Avatar name={selectedChild.avatar} className="text-7xl" />
          <div>
            <h2 className="text-4xl font-bold text-slate-800">Hi, {selectedChild.name}!</h2>
            <p className="text-xl text-slate-500">Ready for a new adventure?</p>
          </div>
        </div>
        <button
          onClick={unselectChild}
          className="bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors"
        >
          Switch Profile
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center flex flex-col justify-between">
            <div>
                <h3 className="text-3xl font-bold mb-4 text-slate-700">Daily Challenge</h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">A new set of math and reading questions for you to do on paper.</p>
            </div>
            <button
            onClick={startActivity}
            className="bg-sky-500 text-white font-black text-2xl py-4 px-10 rounded-xl hover:bg-sky-600 transition-transform transform hover:scale-105 nunito-black"
            >
            START DAILY
            </button>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center flex flex-col justify-between">
            <div>
                <div className="flex justify-center text-purple-500 mb-4"><SpellingIcon/></div>
                <h3 className="text-3xl font-bold mb-4 text-slate-700">Spelling Practice</h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">Listen to the word, then spell it out loud!</p>
            </div>
            <button
            onClick={startSpellingPractice}
            className="bg-purple-500 text-white font-black text-2xl py-4 px-10 rounded-xl hover:bg-purple-600 transition-transform transform hover:scale-105 nunito-black"
            >
            PRACTICE SPELLING
            </button>
        </div>
      </div>
    </div>
  );
}
