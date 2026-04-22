export default function Button({ variant = 'primary', size = 'md', loading, disabled, onClick, children, type = 'button', className = '' }) {
  const baseStyles = 'relative inline-flex items-center justify-center font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 overflow-hidden';
  
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white focus:ring-indigo-500 shadow-indigo-500/40 shadow-lg border border-indigo-400/20',
    secondary: 'bg-white text-gray-800 border-2 border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 focus:ring-indigo-500 hover:text-indigo-700 shadow-sm',
    danger: 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white focus:ring-rose-500 shadow-rose-500/40 shadow-lg',
    ghost: 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-300 shadow-none',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-4 text-base tracking-wide',
  };

  const variantStyles = variants[variant] || variants.primary;
  const sizeStyles = sizes[size] || sizes.md;
  const disabledStyles = (disabled || loading) ? 'opacity-50 cursor-not-allowed transform-none hover:shadow-none saturate-50' : 'hover:-translate-y-0.5 active:scale-95 active:shadow-none hover:shadow-xl';

  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${disabledStyles} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {/* Glossy inner reflection for primary buttons */}
      {(variant === 'primary' || variant === 'danger') && (
        <div className="absolute inset-0 bg-white/20 w-full h-1/3 rounded-t-xl pointer-events-none opacity-50" />
      )}
      
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
