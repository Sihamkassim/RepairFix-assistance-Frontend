import { X, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ErrorToast({ message, details, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 8000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md bg-red-500/10 dark:bg-red-900/20 border border-red-500/30 backdrop-blur-lg rounded-xl shadow-xl transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
            <AlertCircle className="text-red-500" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">Error</h3>
            <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
            {details && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-mono bg-red-500/10 p-2 rounded-lg">
                {details}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-red-400 hover:text-red-600 transition p-1 hover:bg-red-500/10 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
