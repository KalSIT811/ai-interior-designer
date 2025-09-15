import React, { useEffect, useState } from 'react';

interface SnackbarProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export const Snackbar: React.FC<SnackbarProps> = ({ message, onClose, duration = 3000 }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      const closeTimer = setTimeout(onClose, 500); // Wait for exit animation
      return () => clearTimeout(closeTimer);
    }, duration);

    return () => {
      clearTimeout(exitTimer);
    };
  }, [duration, onClose]);

  return (
    <div
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-slate-800 text-white text-sm font-medium rounded-full shadow-lg ${isExiting ? 'animate-snackbar-out' : 'animate-snackbar-in'}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
};
