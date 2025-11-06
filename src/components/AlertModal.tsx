import { HiOutlineXMark, HiOutlineExclamationTriangle, HiOutlineInformationCircle, HiOutlineCheckCircle } from 'react-icons/hi2';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertModalProps {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: string;
  onClose: () => void;
}

export default function AlertModal({ isOpen, type, title, message, onClose }: AlertModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <HiOutlineCheckCircle className="w-6 h-6 text-green-400" />;
      case 'warning':
        return <HiOutlineExclamationTriangle className="w-6 h-6 text-yellow-400" />;
      case 'error':
        return <HiOutlineExclamationTriangle className="w-6 h-6 text-red-400" />;
      default:
        return <HiOutlineInformationCircle className="w-6 h-6 text-blue-400" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'error':
        return 'bg-red-500/10 border-red-500/30';
      default:
        return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4 modal-overlay animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className={`panel max-w-md w-full animate-slideUp ${getBgColor()}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-[#cccccc] opacity-90 mb-4">{message}</p>
            <button
              onClick={onClose}
              className="btn btn-add w-full sm:w-auto sm:px-6"
            >
              OK
            </button>
          </div>
          <button
            onClick={onClose}
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

