import React, { useRef, useEffect } from 'react';
import { ArrowUpDown } from 'lucide-react';

export interface SortOption {
  label: string;
  key: string;
  direction: 'asc' | 'desc';
}

interface SortMenuProps {
  options: SortOption[];
  selectedOption: SortOption;
  onSelect: (option: SortOption) => void;
}

export const SortMenu: React.FC<SortMenuProps> = ({ options, selectedOption, onSelect }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
      >
        {selectedOption.label}
        <ArrowUpDown size={12} />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-36 bg-surfaceHighlight/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl py-1 z-30 overflow-hidden flex flex-col">
          {options.map((option) => (
            <button
              key={option.label}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
              className={`text-left px-4 py-2.5 text-xs transition-colors ${
                selectedOption.label === option.label
                  ? 'bg-background/50 text-text-primary'
                  : 'text-text-secondary hover:bg-background/20 hover:text-text-primary'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

