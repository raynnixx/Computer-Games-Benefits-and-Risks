import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  show: (type: ToastType, title: string, message?: string) => void;
  confirm: (title: string, message: string) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    resolve?: (v: boolean) => void;
  }>({ open: false, title: '', message: '' });

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => remove(id), 4500);
    },
    [remove]
  );

  const confirm = useCallback(
    (title: string, message: string) =>
      new Promise<boolean>((resolve) => {
        setConfirmState({ open: true, title, message, resolve });
      }),
    []
  );

  const closeConfirm = (result: boolean) => {
    confirmState.resolve?.(result);
    setConfirmState({ open: false, title: '', message: '' });
  };

  const icons = {
    success: <CheckCircle size={20} className="text-emerald-400" />,
    error: <AlertCircle size={20} className="text-rose-400" />,
    info: <Info size={20} className="text-violet-400" />,
  };

  const colors = {
    success: 'border-emerald-500/30 bg-emerald-500/[0.07]',
    error: 'border-rose-500/30 bg-rose-500/[0.07]',
    info: 'border-violet-500/30 bg-violet-500/[0.07]',
  };

  return (
    <ToastContext.Provider value={{ show, confirm }}>
      {children}

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className={`pointer-events-auto rounded-2xl border ${colors[t.type]} backdrop-blur-xl shadow-2xl px-4 py-3.5 flex items-start gap-3`}
            >
              <div className="shrink-0 mt-0.5">{icons[t.type]}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white">{t.title}</div>
                {t.message && <div className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{t.message}</div>}
              </div>
              <button
                onClick={() => remove(t.id)}
                className="shrink-0 text-zinc-500 hover:text-white transition-colors -mr-1 -mt-1 p-1"
              >
                <X size={15} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmState.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
            onClick={() => closeConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-3xl border border-zinc-800 bg-[#111114] max-w-sm w-full p-7 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4">
                <AlertCircle size={22} className="text-rose-400" />
              </div>
              <div className="font-display font-bold text-xl text-white mb-2">{confirmState.title}</div>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">{confirmState.message}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => closeConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-sm font-medium hover:bg-zinc-900 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={() => closeConfirm(true)}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium transition-colors"
                >
                  Подтвердить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};
