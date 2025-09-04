import React, { useState, useEffect } from 'react';
import { X, Edit2, Trash2, Search, Users, Globe, UserPlus } from 'lucide-react';
import { useFreelancers } from '../hooks/useFreelancers';
import { EditFreelancerModal } from './EditFreelancerModal';
import { AddFreelancerModal } from './AddFreelancerModal';
import { Freelancer } from '../lib/supabase';

interface ManageFreelancersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageFreelancersModal: React.FC<ManageFreelancersModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { 
    freelancers, 
    loading, 
    error, 
    updateFreelancer, 
    deleteFreelancer,
    addFreelancer,
    fetchFreelancers 
  } = useFreelancers();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFreelancer, setEditingFreelancer] = useState<Freelancer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch freelancers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchFreelancers();
    }
  }, [isOpen]); // Remove fetchFreelancers from dependencies to avoid infinite loop

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !editingFreelancer && !showAddModal) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, editingFreelancer, showAddModal, onClose]);

  if (!isOpen) return null;

  // Filter freelancers based on search
  const filteredFreelancers = freelancers.filter(f => {
    const searchLower = searchTerm.toLowerCase();
    const languageArray = Array.isArray(f.language) ? f.language : [];
    return (
      f.name.toLowerCase().includes(searchLower) ||
      (f.freelancer_type && f.freelancer_type.toLowerCase().includes(searchLower)) ||
      (languageArray.length > 0 && languageArray.some(l => l.toLowerCase().includes(searchLower)))
    );
  });

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      setDeletingId(id);
      const result = await deleteFreelancer(id);
      if (!result.success) {
        alert(result.error || 'Failed to delete freelancer');
      }
      setDeletingId(null);
    }
  };

  const renderLanguages = (languages: string[] | null) => {
    const languageArray = Array.isArray(languages) ? languages : [];
    
    if (languageArray.length === 0) return <span className="text-gray-400">-</span>;
    
    return <span className="text-gray-700">{languageArray.join(', ')}</span>;
  };

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 z-40 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-30"
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5" style={{color: '#F59222'}} />
                Manage Freelancers
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search and Add Button */}
            <div className="p-4 border-b border-gray-200 flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, type, or language..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Add New
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading freelancers...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
              ) : filteredFreelancers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No freelancers found matching your search.' : 'No freelancers added yet.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFreelancers.map((freelancer) => (
                    <div
                      key={freelancer.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{freelancer.name}</h3>
                            {freelancer.freelancer_type && (
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                freelancer.freelancer_type === 'Linguist' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {freelancer.freelancer_type}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Globe className="w-4 h-4 text-gray-400" />
                            {renderLanguages(freelancer.language)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingFreelancer(freelancer)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(freelancer.id, freelancer.name)}
                            disabled={deletingId === freelancer.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                Total: {filteredFreelancers.length} freelancer{filteredFreelancers.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditFreelancerModal
        freelancer={editingFreelancer}
        isOpen={!!editingFreelancer}
        onClose={() => setEditingFreelancer(null)}
        onUpdate={updateFreelancer}
      />

      {/* Add Modal */}
      <AddFreelancerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addFreelancer}
      />
    </>
  );
};