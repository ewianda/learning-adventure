
import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { AVATARS, GRADES, Avatar } from '../constants';
import { Child } from '../types';

export default function ParentDashboard() {
  const { parent, selectChild, addChild, viewProgress, isLoading } = useAppContext();
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildGrade, setNewChildGrade] = useState(GRADES[0]);
  const [newChildAvatar, setNewChildAvatar] = useState(AVATARS[0]);

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newChildName.trim() && !isLoading) {
      await addChild({ name: newChildName.trim(), gradeLevel: newChildGrade, avatar: newChildAvatar });
      setNewChildName('');
      setNewChildGrade(GRADES[0]);
      setNewChildAvatar(AVATARS[0]);
      setIsAddingChild(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-bold text-slate-700">Welcome, {parent?.username}!</h2>
        <button
          onClick={() => setIsAddingChild(!isAddingChild)}
          className="bg-green-500 text-white font-bold py-2 px-5 rounded-lg hover:bg-green-600 transition-colors text-lg"
        >
          {isAddingChild ? 'Cancel' : '+ Add Child'}
        </button>
      </div>

      {isAddingChild && (
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 animate-fade-in-down">
          <h3 className="text-2xl font-bold mb-4 text-slate-600">Create a New Profile</h3>
          <form onSubmit={handleAddChild} className="space-y-4">
            {/* Form fields for adding a child */}
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Child's Name</label>
              <input type="text" value={newChildName} onChange={(e) => setNewChildName(e.target.value)} className="w-full px-3 py-2 bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="e.g., Alex" required disabled={isLoading} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Grade Level</label>
              <select value={newChildGrade} onChange={(e) => setNewChildGrade(e.target.value)} className="w-full px-3 py-2 bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" disabled={isLoading}>
                {GRADES.map(grade => <option key={grade} value={grade}>Grade {grade}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Choose an Avatar</label>
              <div className="flex flex-wrap gap-4">
                {AVATARS.map(avatar => (
                  <button type="button" key={avatar} onClick={() => setNewChildAvatar(avatar)} className={`p-2 rounded-full transition-transform transform hover:scale-110 ${newChildAvatar === avatar ? 'bg-sky-200 ring-2 ring-sky-500' : 'bg-slate-100'}`} disabled={isLoading}>
                    <Avatar name={avatar} />
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className="w-full bg-sky-500 text-white font-bold py-3 rounded-lg hover:bg-sky-600 transition-colors disabled:bg-sky-300" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Profile'}
            </button>
          </form>
        </div>
      )}

      <h3 className="text-3xl font-bold mb-6 text-slate-700">Manage Profiles</h3>
      {parent?.children.length === 0 && !isAddingChild ? (
        <p className="text-center text-slate-500 bg-white p-8 rounded-xl shadow-sm">No child profiles yet. Click "Add Child" to get started!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parent?.children.map((child: Child) => (
            <div key={child.id} className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center gap-4 text-center">
              <Avatar name={child.avatar} className="text-7xl" />
              <span className="text-2xl font-bold text-slate-800">{child.name}</span>
              <span className="text-sm text-slate-500 font-semibold">Grade {child.gradeLevel}</span>
              <div className="flex flex-col sm:flex-row gap-2 w-full mt-2">
                <button onClick={() => selectChild(child.id)} className="flex-1 bg-sky-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors">Start Learning</button>
                <button onClick={() => viewProgress(child)} className="flex-1 bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors">View Progress</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
