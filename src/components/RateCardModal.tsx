import React, { useState, useEffect } from 'react';
import { X, Save, IndianRupee } from 'lucide-react';
import { useRateCard } from '../hooks/useRateCard';

interface RateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RateCardModal: React.FC<RateCardModalProps> = ({ isOpen, onClose }) => {
  const { rates, loading, error, fetchRates, saveRates } = useRateCard();
  const [localRates, setLocalRates] = useState({
    linguist_group_a: 0,
    linguist_group_b: 0,
    expert_group_a: 0,
    expert_group_b: 0,
  });
  const [saving, setSaving] = useState(false);

  // Update local rates when fetched rates change
  useEffect(() => {
    setLocalRates(rates);
  }, [rates]);

  // Fetch rates when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchRates();
    }
  }, [isOpen, fetchRates]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    const result = await saveRates(localRates);
    setSaving(false);
    
    if (result.success) {
      onClose();
    }
  };

  const handleRateChange = (key: keyof typeof localRates, value: string) => {
    const numValue = parseFloat(value) || 0;
    setLocalRates(prev => ({
      ...prev,
      [key]: numValue,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">Rate Card</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Grid Table */}
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Group
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Linguist
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Language Expert
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Group A Row */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Group A
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={localRates.linguist_group_a || ''}
                        onChange={(e) => handleRateChange('linguist_group_a', e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={loading || saving}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={localRates.expert_group_a || ''}
                        onChange={(e) => handleRateChange('expert_group_a', e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={loading || saving}
                      />
                    </div>
                  </td>
                </tr>
                {/* Group B Row */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Group B
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={localRates.linguist_group_b || ''}
                        onChange={(e) => handleRateChange('linguist_group_b', e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={loading || saving}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={localRates.expert_group_b || ''}
                        onChange={(e) => handleRateChange('expert_group_b', e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={loading || saving}
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || saving}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Rates'}
          </button>
        </div>
      </div>
    </div>
  );
};