
import React from 'react';

export default function Spinner() {
  return (
    <div className="flex justify-center items-center" aria-label="Loading">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sky-500"></div>
    </div>
  );
}
