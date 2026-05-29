// apps/web/src/app/components/LoadingSpinner.tsx
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse-fast">
      {/* A simple loading bar */}
    </div>
  );
};

export default LoadingSpinner;
