
import React from 'react';

interface ProgressBarProps {
  score: number | null;
  color: string;
}

export default function ProgressBar({ score, color }: ProgressBarProps) {
  const displayScore = score !== null ? Math.round(score) : 0;
  const displayText = score !== null ? `${displayScore}%` : 'No attempts yet';

  return (
    <div className="w-full">
      <div className="w-full bg-slate-200 rounded-full h-6">
        <div
          className={`${color} h-6 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-500`}
          style={{ width: `${displayScore}%` }}
        >
          {displayScore > 15 && `${displayScore}%`}
        </div>
      </div>
      {displayScore <= 15 && <p className="text-center text-xs font-bold text-slate-600 mt-1">{displayText}</p>}
    </div>
  );
}
