"use client";

import { motion, AnimatePresence } from "framer-motion";
import MaterialIcon from "@/components/icons/MaterialIcon";

interface SystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  type?: "danger" | "info";
}

export default function SystemModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Esegui Protocollo",
  type = "info",
}: SystemModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm bg-white border border-outline shadow-[0_0_50px_rgba(0,0,0,0.3)] overflow-hidden"
          >
            {/* Header / Scanline effect */}
            <div className={`h-1 w-full animate-pulse ${type === 'danger' ? 'bg-error' : 'bg-primary'}`} />
            
            <div className="p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 border ${type === 'danger' ? 'border-error/20 text-error bg-error/5' : 'border-primary/20 text-primary bg-primary/5'}`}>
                  <MaterialIcon name={type === 'danger' ? 'warning' : 'security'} className="text-2xl" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black uppercase tracking-tighter italic leading-none">{title}</h3>
                  <p className="text-[10px] font-black text-outline/50 uppercase tracking-[0.3em]">Autorizzazione di Sicurezza</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-bold text-on-surface leading-relaxed border-l-4 border-outline-variant/30 pl-4 italic opacity-80">
                  {message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={onClose}
                  className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-outline hover:bg-surface-container transition-all border border-outline-variant"
                >
                  Annulla
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`py-4 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-lg transition-transform active:scale-95 ${
                    type === 'danger' ? 'bg-error hover:bg-red-700' : 'bg-primary hover:bg-blue-700'
                  }`}
                >
                  {confirmLabel.toUpperCase()}
                </button>
              </div>
            </div>
            
            <div className="bg-surface-container-low py-3 px-8 flex justify-between items-center border-t border-outline-variant">
              <span className="text-[8px] font-black text-outline/40 tracking-widest uppercase italic">MODULO SICUREZZA</span>
              <div className="flex gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping shadow-[0_0_5px_rgba(0,0,0,0.2)]" />
                <div className="w-1.5 h-1.5 bg-outline-variant rounded-full opacity-30" />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
