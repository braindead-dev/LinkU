"use client";
import { FC } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

/**
 * Simple toast notification component
 */
const Toast: FC<ToastProps> = ({
  message,
  isVisible,
  onClose,
  duration = 4000,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-4 left-1/2 z-50 -translate-x-1/2 transform"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onAnimationComplete={(definition) => {
            if (definition === "animate") {
              // Start auto-dismiss timer after animation completes
              const timer = setTimeout(() => {
                onClose();
              }, duration);
              return () => clearTimeout(timer);
            }
          }}
        >
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
            <span className="text-sm text-gray-900 dark:text-gray-100">
              {message}
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
