import { useEffect } from 'react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'default'
}) {

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = {
    default: 'sm:max-w-md',
    large:   'sm:max-w-2xl',
  }[size];

  return (
    <div className="fixed inset-0 z-50 flex flex-col
                    sm:items-center sm:justify-center">

      <div className="absolute inset-0 bg-black/50
                      backdrop-blur-sm"
           onClick={onClose} />

      <div className={`
        relative z-10 bg-white w-full
        rounded-t-2xl sm:rounded-2xl
        mt-auto sm:mt-0 sm:mx-4
        ${sizeClass}
        shadow-2xl
        max-h-[90vh] flex flex-col
        animate-[slideUpFull_0.25s_ease-out]
        sm:animate-[fadeIn_0.15s_ease-out]
      `}>

        <div className="flex justify-center pt-3 pb-1 sm:hidden
                        flex-shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {title && (
          <div className="flex items-center justify-between
                          px-5 pt-4 pb-3 sm:pt-5 flex-shrink-0
                          border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="
                w-8 h-8 flex items-center justify-center
                text-gray-400 hover:text-gray-600
                rounded-full hover:bg-gray-100
                transition-colors
              "
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none"
                   stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto
                        px-5 pt-4 pb-6
                        overscroll-contain">
          {children}
        </div>

      </div>
    </div>
  );
}
