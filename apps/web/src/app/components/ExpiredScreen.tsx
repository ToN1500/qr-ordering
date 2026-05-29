// apps/web/src/app/components/ExpiredScreen.tsx
import React from 'react';

interface ExpiredScreenProps {
  message?: string;
  subMessage?: string;
}

const ExpiredScreen: React.FC<ExpiredScreenProps> = ({ 
  message = "Invalid Session", 
  subMessage = "Please scan the QR code at your table to begin your experience." 
}) => {
  return (
    <div className="flex flex-col h-screen justify-center text-center px-8 animate-in fade-in duration-500 max-w-md mx-auto">
      <span className="mono mb-6 text-sm uppercase tracking-[0.3em] text-red-900 font-mono">
        {message.toUpperCase()}
      </span>
      <h1 className="text-4xl mb-6 leading-tight font-serif">
        Access Restricted
      </h1>
      <p className="text-gray-500 mb-10 text-lg font-serif italic">
        {subMessage}
      </p>
      <div className="w-16 h-px bg-gray-200 mx-auto"></div>
    </div>
  );
};

export default ExpiredScreen;
