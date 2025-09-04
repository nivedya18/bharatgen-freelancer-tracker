import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export interface ComboboxOption {
  value: string;
  label: string;
  id?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  error?: boolean;
  success?: boolean;
  onAddNew?: (value: string) => void;
  addNewLabel?: string;
  minSearchLength?: number;
  disabled?: boolean;
}

export const Combobox: React.FC<ComboboxProps> = React.memo(({
  options,
  value,
  onChange,
  searchPlaceholder = 'Type to search...',
  className = '',
  error = false,
  success = false,
  onAddNew,
  addNewLabel = 'Add new',
  minSearchLength = 1,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!search || search.length < minSearchLength) return [];
    const searchLower = search.toLowerCase();
    return options.filter(opt => 
      opt.label.toLowerCase().includes(searchLower)
    );
  }, [options, search, minSearchLength]);

  // Check for exact match
  const exactMatch = useMemo(() => {
    return options.find(opt => 
      opt.label.toLowerCase() === search.toLowerCase()
    );
  }, [options, search]);

  // Handle selection
  const handleSelect = useCallback((option: ComboboxOption) => {
    onChange(option.value);
    setSearch(option.label);
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, [onChange]);

  // Handle add new
  const handleAddNew = useCallback(() => {
    if (onAddNew && search.trim()) {
      onAddNew(search.trim());
      setIsOpen(false);
    }
  }, [onAddNew, search]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex]);
        } else if (onAddNew && search.trim() && !exactMatch) {
          handleAddNew();
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      
      case 'Tab':
        setIsOpen(false);
        break;
    }
  }, [isOpen, filteredOptions, highlightedIndex, handleSelect, onAddNew, search, exactMatch, handleAddNew]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearch(newValue);
    setIsOpen(newValue.length >= minSearchLength);
    setHighlightedIndex(-1);
    
    // Check for exact match and auto-select
    const match = options.find(opt => 
      opt.label.toLowerCase() === newValue.toLowerCase()
    );
    if (match) {
      onChange(match.value);
    } else {
      onChange('');
    }
  }, [options, onChange, minSearchLength]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'auto'
      });
    }
  }, [highlightedIndex]);

  // Update search when value changes externally
  useEffect(() => {
    const option = options.find(opt => opt.value === value);
    if (option) {
      setSearch(option.label);
    }
  }, [value, options]);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => !disabled && search.length >= minSearchLength && setIsOpen(true)}
          placeholder={searchPlaceholder}
          disabled={disabled}
          className={`
            input-base pr-8
            ${error ? 'input-error' : ''}
            ${success && value ? 'border-green-500' : ''}
            ${exactMatch ? 'font-medium text-gray-900' : 'text-gray-900'}
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
          `}
        />
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {isOpen && search.length >= minSearchLength && (
        <div 
          ref={dropdownRef}
          className="dropdown-base"
        >
          {/* Search indicator */}
          <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 text-sm text-gray-600 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <Search className="w-3 h-3" />
              {filteredOptions.length} result{filteredOptions.length !== 1 ? 's' : ''}
            </span>
            <span className="text-gray-400">↵ · ESC</span>
          </div>

          {/* Options */}
          {filteredOptions.length > 0 ? (
            <div className="py-1">
              {filteredOptions.map((option, index) => (
                <button
                  key={option.id || option.value}
                  ref={el => itemRefs.current[index] = el}
                  type="button"
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`
                    dropdown-item w-full text-left
                    ${highlightedIndex === index ? 'dropdown-item-active' : ''}
                  `}
                >
                  {/* Highlight matching text */}
                  {highlightText(option.label, search)}
                </button>
              ))}
            </div>
          ) : search.trim() ? (
            <div className="px-3 py-2.5 text-base text-gray-500 text-center">
              No results found
            </div>
          ) : null}

          {/* Add new option */}
          {onAddNew && search.trim() && !exactMatch && (
            <button
              type="button"
              onClick={handleAddNew}
              className="w-full px-3 py-2.5 text-base text-left border-t border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-700 font-medium"
            >
              + {addNewLabel} "{search}"
            </button>
          )}
        </div>
      )}
    </div>
  );
});

// Helper function to highlight matching text
function highlightText(text: string, search: string) {
  if (!search) return text;
  
  const parts = text.split(new RegExp(`(${search})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === search.toLowerCase() ? (
          <span key={i} className="font-semibold px-0.5 rounded" style={{color: '#F59222', backgroundColor: 'rgba(245, 146, 34, 0.1)'}}>{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

Combobox.displayName = 'Combobox';