import React from 'react';

interface Option {
  label: string;
  value: string;
}

interface SegmentedButtonProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

export const SegmentedButton: React.FC<SegmentedButtonProps> = ({ options, value, onChange }) => {
  const selectedIndex = options.findIndex(opt => opt.value === value);

  return (
    <div className="relative flex w-full p-1 bg-slate-200/50 rounded-lg border border-slate-300/80">
      {options.length > 0 && (
         <div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-md shadow-md transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(${selectedIndex * 100}%)`, left: '4px' }}
        />
      )}
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`relative w-1/2 px-4 py-2 text-sm font-medium transition-colors focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 focus:ring-primary rounded-md ${
            value === option.value ? 'text-primary' : 'text-slate-700 hover:text-slate-900'
          }`}
          aria-pressed={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
