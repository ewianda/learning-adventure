
import React from 'react';
import { useAppContext } from './hooks/useAppContext';
import LoginScreen from './components/LoginScreen';
import ParentDashboard from './components/ParentDashboard';
import ChildDashboard from './components/ChildDashboard';
import DailyActivityView from './components/DailyActivityView';
import ProgressReport from './components/ProgressReport';
import SpellingPracticeView from './components/SpellingPracticeView';
import { HeaderIcon } from './constants';

export default function App() {
  const { parent, selectedChild, viewingProgressFor, isDoingActivity, isPracticingSpelling, logout, endActivity, endSpellingPractice, exitProgressView } = useAppContext();

  const renderContent = () => {
    if (isPracticingSpelling) {
      return <SpellingPracticeView />;
    }
    if (viewingProgressFor) {
      return <ProgressReport />;
    }
    if (isDoingActivity) {
      return <DailyActivityView />;
    }
    if (parent && selectedChild) {
      return <ChildDashboard />;
    }
    if (parent) {
      return <ParentDashboard />;
    }
    return <LoginScreen />;
  };

  const handleLogout = async () => {
    if (isDoingActivity) endActivity();
    if (isPracticingSpelling) endSpellingPractice();
    if (viewingProgressFor) exitProgressView();
    await logout();
  };

  return (
    <div className="min-h-screen bg-sky-50 text-slate-800">
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <HeaderIcon />
          <h1 className="text-2xl md:text-3xl font-bold text-sky-600 nunito-black">Learning Adventure</h1>
        </div>
        <div>
          {parent && (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </header>
      <main className="p-4 md:p-8">
        {renderContent()}
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Learning Adventure. Let's make learning fun!</p>
      </footer>
    </div>
  );
}
