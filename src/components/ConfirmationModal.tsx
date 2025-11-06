import { HiOutlineExclamationTriangle, HiOutlineXMark } from 'react-icons/hi2';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'warning',
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getBgColor = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-500/10 border-red-500/30';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'btn btn-danger';
      case 'warning':
        return 'btn btn-add';
      default:
        return 'btn btn-add';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4 modal-overlay animate-fadeIn"
      onClick={onCancel}
    >
      <div 
        className={`panel max-w-md w-full animate-slideUp ${getBgColor()}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            <HiOutlineExclamationTriangle className={`w-6 h-6 ${
              type === 'danger' ? 'text-red-400' : 
              type === 'warning' ? 'text-yellow-400' : 
              'text-blue-400'
            }`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-[#cccccc] opacity-90 mb-6">{message}</p>
            <div className="flex gap-3">
              <button
                onClick={onConfirm}
                className={`${getConfirmButtonClass()} flex-1`}
              >
                {confirmText}
              </button>
              <button
                onClick={onCancel}
                className="btn btn-ghost flex-1"
              >
                {cancelText}
              </button>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-[#333333] transition-colors"
            aria-label="Close"
          >
            <HiOutlineXMark className="w-5 h-5 text-[#cccccc] hover:text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

