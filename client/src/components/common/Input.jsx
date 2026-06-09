import { forwardRef } from 'react';

const Input = forwardRef(function Input({ label, name, type = 'text', placeholder, error, value, onChange, disabled, className = '', ...props }, ref) {
  return (
    <div className={`flex flex-col w-full group ${className}`}>
      {label && <label htmlFor={name} className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-green-600 transition-colors">{label}</label>}
      <input
        ref={ref}
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`px-4 py-3 bg-white border-2 rounded-xl shadow-sm transition-all duration-300 outline-none min-h-[44px]
          ${error 
            ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 text-rose-900 bg-rose-50 placeholder-rose-300' 
            : 'border-slate-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 text-slate-800 placeholder-slate-400 hover:border-slate-300'
          } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50 border-slate-200' : ''}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-rose-500 font-bold flex items-center gap-1">
          <svg aria-hidden="true" className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
});

export default Input;
