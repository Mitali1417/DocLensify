import React, { useEffect } from 'react';
import { IoCheckmarkCircle, IoAlertCircle, IoClose } from 'react-icons/io5';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const styles = {
    success: "text-emerald-400",
    error: "text-red-400",
    info: "text-blue-400"
  };

  const icons = {
    success: <IoCheckmarkCircle className="text-xl" />,
    error: <IoAlertCircle className="text-xl" />,
    info: <IoAlertCircle className="text-xl" />
  };

  return (
    <div className={`
      fixed bottom-5 right-5 flex items-center gap-3 px-4 py-3 
      rounded-xl border shadow-2xl backdrop-blur-md z-50
      animate-in slide-in-from-right-10 fade-in duration-300 bg-bg-dark border-border-dark text-white
      ${styles[type]}
    `}>
      <div className="shrink-0">
        {icons[type]}
      </div>
      
      <div className="grow">
        <p className="text-sm font-semibold text-current!">
          {message}
        </p>
      </div>

      <button 
        onClick={onClose}
        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
      >
        <IoClose className="text-lg" />
      </button>
    </div>
  );
};

export default Toast;