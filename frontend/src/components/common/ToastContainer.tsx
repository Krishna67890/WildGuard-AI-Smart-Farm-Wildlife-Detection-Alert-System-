import React from 'react';
import { useAlert } from '../../context/AlertContext';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAlert();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const isCritical = toast.type === 'CRITICAL';
        const isHigh = toast.type === 'HIGH';
        const isSuccess = toast.type === 'SUCCESS';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start space-x-3 p-3.5 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-slide-up ${
              isCritical
                ? 'bg-rose-950/90 border-rose-500 text-rose-100 shadow-rose-950/50'
                : isHigh
                  ? 'bg-amber-950/90 border-amber-500 text-amber-100 shadow-amber-950/50'
                  : isSuccess
                    ? 'bg-emerald-950/90 border-emerald-500 text-emerald-100 shadow-emerald-950/50'
                    : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {isCritical && <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />}
              {isHigh && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'INFO' && <Info className="w-5 h-5 text-teal-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold tracking-wide uppercase">{toast.title}</p>
                <span className="text-[10px] text-slate-400 ml-2">{toast.timestamp}</span>
              </div>
              <p className="text-xs mt-0.5 text-slate-300 leading-relaxed">{toast.description}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
