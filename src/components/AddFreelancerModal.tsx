import React, { useState, useEffect, useRef } from 'react';
import { X, UserPlus } from 'lucide-react';
import { FormField } from './FormField';

interface AddFreelancerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string) => Promise<{ success: boolean; error?: string; data?: any }>;
}

export const AddFreelancerModal: React.FC<AddFreelancerModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd 
}) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    setError('');

    const result = await onAdd(name.trim());
    
    if (result.success) {
      setName('');
      onClose();
    } else {
      setError(result.error || 'Failed to add freelancer');
    }
    
    setLoading(false);
  };

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop - no animation */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-30"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <UserPlus className="w-4 h-4" style={{color: '#F59222'}} />
              Add New Freelancer
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

          <form onSubmit={handleSubmit}>
            <FormField 
              label="Freelancer Name" 
              required 
              error={error}
              icon={<UserPlus className="w-3 h-3" />}
            >
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(''); // Clear error on type
                }}
                className="input-base"
                placeholder="Enter freelancer name"
              />
            </FormField>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={handleClose}
                className="btn-base btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className={`
                  btn-base btn-primary
                  ${loading || !name.trim() ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {loading ? 'Adding...' : 'Add Freelancer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};