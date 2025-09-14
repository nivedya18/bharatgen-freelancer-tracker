import React from 'react';
import { FilterState } from '../types';
import { useFreelancerTasks } from '../hooks/useFreelancerTasks';
import { Filter, X } from 'lucide-react';
import { MultiSelectCombobox, MultiSelectOption } from './MultiSelectCombobox';

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
      freelancer_name: [],
      language: [],
      model: [],
      freelancer_type: '',
      task_status: '',
      search: '',
    });
  };

  const uniqueFreelancers = getUniqueValues('freelancer_name');
  const uniqueLanguages = getUniqueValues('language');
  const uniqueModels = getUniqueValues('model');
  
  // Convert to MultiSelectOptions
  const freelancerOptions: MultiSelectOption[] = uniqueFreelancers.map(name => ({
    value: name,
    label: name
  }));
  
  const languageOptions: MultiSelectOption[] = uniqueLanguages.map(lang => ({
    value: lang,
    label: lang
  }));
  
  const modelOptions: MultiSelectOption[] = uniqueModels.map(model => ({
    value: model,
    label: model
  }));

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Search */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search tasks, models, languages, freelancers, or types..."
            className="w-full px-3.5 py-2.5 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 min-h-[42px]"
            style={{"--tw-ring-color": "rgba(5, 83, 156, 0.15)", "--tw-border-opacity": "1", borderColor: "rgba(5, 83, 156, var(--tw-border-opacity))"} as React.CSSProperties}
          />
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => handleDateRangeChange('start', e.target.value)}
            className={`w-full px-3.5 py-2.5 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 min-h-[42px] ${!filters.dateRange.start ? 'text-gray-500' : ''}`}
            onFocus={(e) => {e.target.style.borderColor = '#05539C'; e.target.style.boxShadow = '0 0 0 3px rgba(5, 83, 156, 0.15)';}}
            onBlur={(e) => {e.target.style.borderColor = ''; e.target.style.boxShadow = '';}}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => handleDateRangeChange('end', e.target.value)}
            className={`w-full px-3.5 py-2.5 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 min-h-[42px] ${!filters.dateRange.end ? 'text-gray-500' : ''}`}
            onFocus={(e) => {e.target.style.borderColor = '#05539C'; e.target.style.boxShadow = '0 0 0 3px rgba(5, 83, 156, 0.15)';}}
            onBlur={(e) => {e.target.style.borderColor = ''; e.target.style.boxShadow = '';}}
          />
        </div>

        {/* Freelancer Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Freelancer
          </label>
          <MultiSelectCombobox
            options={freelancerOptions}
            values={Array.isArray(filters.freelancer_name) ? filters.freelancer_name : filters.freelancer_name ? [filters.freelancer_name] : []}
            onChange={(values) => handleFilterChange('freelancer_name', values)}
            placeholder="All Freelancers"
            searchPlaceholder="Type to search..."
            minSearchLength={0}
          />
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <MultiSelectCombobox
            options={languageOptions}
            values={Array.isArray(filters.language) ? filters.language : filters.language ? [filters.language] : []}
            onChange={(values) => handleFilterChange('language', values)}
            placeholder="All Languages"
            searchPlaceholder="Type to search..."
            minSearchLength={0}
          />
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model
          </label>
          <MultiSelectCombobox
            options={modelOptions}
            values={Array.isArray(filters.model) ? filters.model : filters.model ? [filters.model] : []}
            onChange={(values) => handleFilterChange('model', values)}
            placeholder="All Models"
            searchPlaceholder="Type to search..."
            minSearchLength={0}
          />
        </div>

        {/* Freelancer Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <select
            value={filters.freelancer_type}
            onChange={(e) => handleFilterChange('freelancer_type', e.target.value)}
            className={`w-full px-3.5 py-2.5 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 min-h-[42px] ${!filters.freelancer_type ? 'text-gray-500' : ''}`}
            onFocus={(e) => {e.target.style.borderColor = '#05539C'; e.target.style.boxShadow = '0 0 0 3px rgba(5, 83, 156, 0.15)';}}
            onBlur={(e) => {e.target.style.borderColor = ''; e.target.style.boxShadow = '';}}
          >
            <option value="">All Types</option>
            <option value="Linguist">Linguist</option>
            <option value="Language Expert">Language Expert</option>
          </select>
        </div>

        {/* Task Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.task_status}
            onChange={(e) => handleFilterChange('task_status', e.target.value)}
            className={`w-full px-3.5 py-2.5 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 min-h-[42px] ${!filters.task_status ? 'text-gray-500' : ''}`}
            onFocus={(e) => {e.target.style.borderColor = '#05539C'; e.target.style.boxShadow = '0 0 0 3px rgba(5, 83, 156, 0.15)';}}
            onBlur={(e) => {e.target.style.borderColor = ''; e.target.style.boxShadow = '';}}
          >
            <option value="">All Status</option>
            <option value="Planned">Planned</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>
    </div>
  );
};