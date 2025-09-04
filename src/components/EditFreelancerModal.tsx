import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Globe, User } from 'lucide-react';
import { FormField } from './FormField';
import { MultiSelectCombobox, MultiSelectOption } from './MultiSelectCombobox';
import { Freelancer, FreelancerUpdate } from '../lib/supabase';

const languages: MultiSelectOption[] = [
  'Assamese', 'Bengali', 'English', 'Gujarati', 'Hindi', 'Kannada',
  'Maithili', 'Malayalam', 'Marathi', 'Nepali', 'Odia', 'Punjabi',
  'Sanskrit', 'Sindhi', 'Tamil', 'Telugu'
].map(lang => ({ value: lang, label: lang }));

interface EditFreelancerModalProps {
  freelancer: Freelancer | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<FreelancerUpdate>) => Promise<{ success: boolean; error?: string }>;
}

export const EditFreelancerModal: React.FC<EditFreelancerModalProps> = ({ 
  freelancer,
  isOpen, 
  onClose, 
  onUpdate 
}) => {
  const [name, setName] = useState('');
  const [freelancerType, setFreelancerType] = useState<'Linguist' | 'Language Expert' | ''>('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Update form when freelancer changes
  useEffect(() => {
    if (freelancer && isOpen) {
      setName(freelancer.name);
      setFreelancerType(freelancer.freelancer_type || '');
      // Handle both array and non-array formats
      const langs = Array.isArray(freelancer.language) ? freelancer.language : [];
      setSelectedLanguages(langs);
      setError('');
    }
  }, [freelancer, isOpen]);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  if (!isOpen || !freelancer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!freelancerType) {
      setError('Freelancer type is required');
      return;
    }

    if (selectedLanguages.length === 0) {
      setError('At least one language is required');
      return;
    }

    setLoading(true);
    setError('');

    const updates: Partial<FreelancerUpdate> = {
      name: name.trim(),
      freelancer_type: freelancerType,
      language: selectedLanguages
    };

    const result = await onUpdate(freelancer.id, updates);
    
    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Failed to update freelancer');
    }
    
    setLoading(false);
  };

  const handleClose = () => {
    setName('');
    setFreelancerType('');
    setSelectedLanguages([]);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-30"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-4 h-4" style={{color: '#F59222'}} />
              Edit Freelancer
            </h3>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField 
              label="Freelancer Name" 
              required 
              error={error}
              icon={<User className="w-3 h-3" />}
            >
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                className="input-base"
                placeholder="Enter freelancer name"
              />
            </FormField>

            <FormField
              label="Freelancer Type"
              required
              icon={<User className="w-3 h-3" />}
            >
              <select
                value={freelancerType}
                onChange={(e) => {
                  setFreelancerType(e.target.value as 'Linguist' | 'Language Expert' | '');
                  setError('');
                }}
                className={`input-base ${freelancerType ? 'text-gray-900' : 'text-gray-500'}`}
              >
                <option value="" className="text-gray-500">Select type</option>
                <option value="Linguist">Linguist</option>
                <option value="Language Expert">Language Expert</option>
              </select>
            </FormField>

            <FormField
              label="Languages"
              required
              icon={<Globe className="w-3 h-3" />}
            >
              <MultiSelectCombobox
                options={languages}
                values={selectedLanguages}
                onChange={(values) => {
                  setSelectedLanguages(values);
                  setError('');
                }}
                placeholder="Select languages"
                searchPlaceholder="Type to search languages..."
              />
            </FormField>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="btn-base btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim() || !freelancerType || selectedLanguages.length === 0}
                className={`
                  btn-base btn-primary flex items-center gap-2
                  ${loading || !name.trim() || !freelancerType || selectedLanguages.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <Save className="w-4 h-4" />
                {loading ? 'Updating...' : 'Update Freelancer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};