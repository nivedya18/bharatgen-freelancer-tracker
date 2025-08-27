import React from 'react';
import { FilterState } from '../types';
import { useFreelancerTasks } from '../hooks/useFreelancerTasks';
import { Filter, X } from 'lucide-react';

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange }) => {
  const { getUniqueValues } = useFreelancerTasks();

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleDateRangeChange = (key: 'start' | 'end', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [key]: value,
      },
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      dateRange: { start: '', end: '' },
      freelancer_name: '',
      language: '',
      model: '',
      freelancer_type: '',
      search: '',
    });
  };

  const uniqueFreelancers = getUniqueValues('freelancer_name');
  const uniqueLanguages = getUniqueValues('language');
  const uniqueModels = getUniqueValues('model');

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </h3>
        <button
          onClick={clearFilters}
          className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search tasks, models, languages, or freelancers..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => handleDateRangeChange('start', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => handleDateRangeChange('end', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Freelancer Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Freelancer
          </label>
          <select
            value={filters.freelancer_name}
            onChange={(e) => handleFilterChange('freelancer_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Freelancers</option>
            {uniqueFreelancers.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            value={filters.language}
            onChange={(e) => handleFilterChange('language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Languages</option>
            {uniqueLanguages.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          <select
            value={filters.model}
            onChange={(e) => handleFilterChange('model', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Models</option>
            {uniqueModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        {/* Freelancer Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={filters.freelancer_type}
            onChange={(e) => handleFilterChange('freelancer_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="Linguist">Linguist</option>
            <option value="Language Expert">Language Expert</option>
          </select>
        </div>
      </div>
    </div>
  );
};