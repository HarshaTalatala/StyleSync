import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.92, y: 40 }} 
          animate={{ scale: 1, y: 0 }} 
          exit={{ scale: 0.92, y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-hidden border border-slate-200"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 focus:outline-none"
            aria-label="Close dialog"
          >
            <FaTimes size={18} />
          </button>

          <div className="flex flex-col items-center p-8 pt-10">
            <div className="bg-red-100 p-4 rounded-full mb-4 shadow-sm">
              <FaExclamationTriangle className="text-red-500" size={36} />
            </div>
            <h3 className="text-2xl font-semibold text-slate-800 mb-2 text-center">{title || 'Are you sure?'}</h3>
            <p className="text-base text-slate-600 mb-8 text-center">{message}</p>
            <div className="flex justify-center gap-4 w-full">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-medium bg-white hover:bg-slate-50 hover:border-slate-400 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors shadow-sm focus:outline-none"
              >
                OK
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmDialog;
