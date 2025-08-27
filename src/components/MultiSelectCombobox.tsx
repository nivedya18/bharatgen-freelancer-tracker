import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, X, Check, Search } from 'lucide-react';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectComboboxProps {
  options: MultiSelectOption[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  minSearchLength?: number;
}

export const MultiSelectCombobox: React.FC<MultiSelectComboboxProps> = React.memo(({
  options,
  values,
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Type to search...',
  className = '',
  minSearchLength = 0
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!search || search.length < minSearchLength) return options;
    const searchLower = search.toLowerCase();
    return options.filter(opt => 
      opt.label.toLowerCase().includes(searchLower)
    );
  }, [options, search, minSearchLength]);

  // Handle selection toggle
  const toggleSelection = useCallback((option: MultiSelectOption, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const newValues = values.includes(option.value)
      ? values.filter(v => v !== option.value)
      : [...values, option.value];
    onChange(newValues);
    // Keep dropdown open after selection
    setSearch('');
  }, [values, onChange]);

  // Handle remove tag
  const removeValue = useCallback((value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(values.filter(v => v !== value));
  }, [values, onChange]);

  // Clear all selections
  const clearAll = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
    setSearch('');
  }, [onChange]);

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
          toggleSelection(filteredOptions[highlightedIndex]);
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  }, [isOpen, filteredOptions, highlightedIndex, toggleSelection]);

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


  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3.5 py-2.5 text-base border border-gray-300 rounded-md bg-white cursor-pointer min-h-[42px] flex items-center gap-2 flex-wrap focus-within:ring-1 focus-within:border-gray-300"
          style={{"--tw-ring-color": "rgba(5, 83, 156, 0.15)"} as React.CSSProperties}
        >
          {values.length > 0 ? (
            <>
              {values.slice(0, 2).map(value => {
                const option = options.find(opt => opt.value === value);
                return option ? (
                  <span
                    key={value}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-sm text-white rounded"
                    style={{backgroundColor: '#05539C'}}
                  >
                    {option.label}
                    <X
                      className="w-3 h-3 cursor-pointer hover:opacity-80"
                      onClick={(e) => removeValue(value, e)}
                    />
                  </span>
                ) : null;
              })}
              {values.length > 2 && (
                <span className="text-sm text-gray-600">
                  +{values.length - 2} more
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-500 text-base">{placeholder}</span>
          )}
        </div>
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {values.length > 0 && (
            <X
              className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={clearAll}
            />
          )}
          <ChevronDown className="w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {isOpen && (
        <div 
          ref={dropdownRef}
          className="dropdown-base"
        >
          {/* Search input */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-2 py-1.5 text-base border border-gray-200 rounded focus:outline-none"
                style={{borderColor: '#05539C'}}
                autoFocus
              />
            </div>
          </div>

          {/* Search indicator with bulk actions */}
          <div className="px-3 py-1.5 border-b border-gray-100 bg-gray-50 text-xs text-gray-600 flex items-center justify-between">
            <span className="font-medium">
              {filteredOptions.length} result{filteredOptions.length !== 1 ? 's' : ''} · {values.length} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(filteredOptions.map(opt => opt.value));
                }}
                className="px-2 py-0.5 text-xs font-medium hover:text-blue-600"
                style={{color: '#05539C'}}
              >
                Select All
              </button>
              {values.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange([]);
                  }}
                  className="px-2 py-0.5 text-xs font-medium hover:text-orange-600"
                  style={{color: '#F59222'}}
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Options */}
          {filteredOptions.length > 0 ? (
            <div className="py-1 max-h-60 overflow-auto">
              {filteredOptions.map((option, index) => {
                const isSelected = values.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={(e) => toggleSelection(option, e)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`
                      w-full px-3 py-2 text-base text-left flex items-center justify-between
                      ${highlightedIndex === index ? '' : 'hover:bg-gray-50'}
                      ${isSelected ? 'font-medium' : ''}"
                    style={highlightedIndex === index ? {backgroundColor: 'rgba(245, 146, 34, 0.1)'} : isSelected ? {color: '#05539C'} : {}}
                    `}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="w-4 h-4" style={{color: '#F59222'}} />}
                  </button>
                );
              })}
            </div>
          ) : search.trim() ? (
            <div className="px-3 py-2.5 text-base text-gray-500 text-center">
              No results found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
});

MultiSelectCombobox.displayName = 'MultiSelectCombobox';