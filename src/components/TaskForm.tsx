import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, TaskFormData } from '../schemas/taskSchema';
import { useFreelancerTasks } from '../hooks/useFreelancerTasks';
import { useFreelancers } from '../hooks/useFreelancers';
import { AddFreelancerModal } from './AddFreelancerModal';
import { CheckCircle, AlertCircle, Calculator, ChevronDown, UserPlus } from 'lucide-react';
import { addDays, format } from 'date-fns';

const languages = [
  'Assamese',
  'Bengali',
  'English',
  'Gujarati',
  'Hindi',
  'Kannada',
  'Maithili',
  'Malayalam',
  'Marathi',
  'Nepali',
  'Odia',
  'Punjabi',
  'Sanskrit',
  'Sindhi',
  'Tamil',
  'Telugu',
];

export const TaskForm: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [languageSearch, setLanguageSearch] = useState('');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [freelancerSearch, setFreelancerSearch] = useState('');
  const [showFreelancerDropdown, setShowFreelancerDropdown] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState('');
  const [showAddFreelancerModal, setShowAddFreelancerModal] = useState(false);
  
  const languageInputRef = useRef<HTMLInputElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const freelancerInputRef = useRef<HTMLInputElement>(null);
  const freelancerDropdownRef = useRef<HTMLDivElement>(null);
  
  const { addTask } = useFreelancerTasks();
  const { freelancers, addFreelancer, searchFreelancers } = useFreelancers();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const payRate = watch('pay_rate_per_day') || 0;
  const timeTaken = watch('total_time_taken') || 0;
  const startDate = watch('start_date');
  const totalPayment = payRate * timeTaken;

  // Filter languages based on search
  const filteredLanguages = languages.filter(lang =>
    lang.toLowerCase().includes(languageSearch.toLowerCase())
  );

  // Filter freelancers based on search
  const filteredFreelancers = searchFreelancers(freelancerSearch);

  // Auto-calculate completion date when start date or time taken changes
  useEffect(() => {
    if (startDate && timeTaken && timeTaken > 0) {
      const start = new Date(startDate);
      // Subtract 1 from timeTaken since the start date counts as day 1
      const completionDate = addDays(start, Math.ceil(timeTaken) - 1);
      setValue('completion_date', format(completionDate, 'yyyy-MM-dd'));
    }
  }, [startDate, timeTaken, setValue]);

  // Handle clicking outside of dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Language dropdown
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node) &&
        languageInputRef.current &&
        !languageInputRef.current.contains(event.target as Node)
      ) {
        setShowLanguageDropdown(false);
      }
      
      // Freelancer dropdown
      if (
        freelancerDropdownRef.current &&
        !freelancerDropdownRef.current.contains(event.target as Node) &&
        freelancerInputRef.current &&
        !freelancerInputRef.current.contains(event.target as Node)
      ) {
        setShowFreelancerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setLanguageSearch(language);
    setValue('language', language);
    setShowLanguageDropdown(false);
  };

  const handleLanguageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLanguageSearch(value);
    setShowLanguageDropdown(true);
    
    // Check if the typed value exactly matches a language
    const exactMatch = languages.find(lang => lang.toLowerCase() === value.toLowerCase());
    if (exactMatch) {
      setValue('language', exactMatch);
      setSelectedLanguage(exactMatch);
    } else {
      setValue('language', '');
      setSelectedLanguage('');
    }
  };

  const handleFreelancerSelect = (freelancer: string) => {
    setSelectedFreelancer(freelancer);
    setFreelancerSearch(freelancer);
    setValue('freelancer_name', freelancer);
    setShowFreelancerDropdown(false);
  };

  const handleFreelancerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFreelancerSearch(value);
    
    // Only show dropdown if there's text typed
    setShowFreelancerDropdown(value.trim().length > 0);
    
    // Check if the typed value exactly matches a freelancer
    const exactMatch = freelancers.find(f => f.name.toLowerCase() === value.toLowerCase());
    if (exactMatch) {
      setValue('freelancer_name', exactMatch.name);
      setSelectedFreelancer(exactMatch.name);
    } else {
      setValue('freelancer_name', '');
      setSelectedFreelancer('');
    }
  };

  const handleAddFreelancer = async (name: string) => {
    const result = await addFreelancer(name);
    if (result.success && result.data) {
      // Auto-select the newly added freelancer
      handleFreelancerSelect(result.data.name);
      setShowAddFreelancerModal(false);
    }
    return result;
  };

  const onSubmit = async (data: TaskFormData) => {
    const result = await addTask(data);
    
    if (result.success) {
      setShowSuccess(true);
      reset();
      setLanguageSearch('');
      setSelectedLanguage('');
      setFreelancerSearch('');
      setSelectedFreelancer('');
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Task</h2>
      
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">Task added successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Task */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task *
            </label>
            <input
              type="text"
              {...register('task')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task description"
            />
            {errors.task && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.task.message}
              </p>
            )}
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model *
            </label>
            <select
              {...register('model')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select model</option>
              <option value="Text LLM">Text LLM</option>
              <option value="TTS">TTS</option>
              <option value="ASR">ASR</option>
            </select>
            {errors.model && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.model.message}
              </p>
            )}
          </div>

          {/* Language */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language *
            </label>
            <div className="relative">
              <input
                type="text"
                ref={languageInputRef}
                value={languageSearch}
                onChange={handleLanguageInputChange}
                onFocus={() => setShowLanguageDropdown(true)}
                placeholder="Type to search languages..."
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="hidden"
                {...register('language')}
                value={selectedLanguage}
              />
              <ChevronDown 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              />
              
              {/* Dropdown */}
              {showLanguageDropdown && (
                <div 
                  ref={languageDropdownRef}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                >
                  {filteredLanguages.length > 0 ? (
                    filteredLanguages.map(language => (
                      <button
                        key={language}
                        type="button"
                        onClick={() => handleLanguageSelect(language)}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors"
                      >
                        {language}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500">
                      No languages found
                    </div>
                  )}
                </div>
              )}
            </div>
            {errors.language && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.language.message}
              </p>
            )}
          </div>

          {/* Freelancer Name */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Freelancer Name *
            </label>
            <div className="relative">
              <input
                type="text"
                ref={freelancerInputRef}
                value={freelancerSearch}
                onChange={handleFreelancerInputChange}
                onFocus={() => {
                  // Only show dropdown if there's text typed
                  if (freelancerSearch.trim()) {
                    setShowFreelancerDropdown(true);
                  }
                }}
                placeholder="Type to search freelancers..."
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="hidden"
                {...register('freelancer_name')}
                value={selectedFreelancer}
              />
              <ChevronDown 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              />
              
              {/* Dropdown */}
              {showFreelancerDropdown && (
                <div 
                  ref={freelancerDropdownRef}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                >
                  {filteredFreelancers.length > 0 ? (
                    <>
                      {filteredFreelancers.map(freelancer => (
                        <button
                          key={freelancer.id}
                          type="button"
                          onClick={() => handleFreelancerSelect(freelancer.name)}
                          className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors"
                        >
                          {freelancer.name}
                        </button>
                      ))}
                    </>
                  ) : freelancerSearch.trim() ? (
                    <div className="px-3 py-2 text-gray-500">
                      No freelancers found
                    </div>
                  ) : null}
                  
                  {/* Add New Freelancer Option */}
                  {freelancerSearch.trim() && (
                    <button
                      type="button"
                      onClick={() => setShowAddFreelancerModal(true)}
                      className="w-full text-left px-3 py-2 hover:bg-green-50 focus:bg-green-50 focus:outline-none transition-colors border-t border-gray-200 text-green-700 font-medium flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add "{freelancerSearch}" as new freelancer
                    </button>
                  )}
                </div>
              )}
            </div>
            {errors.freelancer_name && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.freelancer_name.message}
              </p>
            )}
          </div>

          {/* Freelancer Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Freelancer Type *
            </label>
            <select
              {...register('freelancer_type')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select type</option>
              <option value="Linguist">Linguist</option>
              <option value="Language Expert">Language Expert</option>
            </select>
            {errors.freelancer_type && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.freelancer_type.message}
              </p>
            )}
          </div>

          {/* Pay Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pay Rate (₹/day) *
            </label>
            <input
              type="number"
              step="0.01"
              {...register('pay_rate_per_day', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter pay rate per day"
            />
            {errors.pay_rate_per_day && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.pay_rate_per_day.message}
              </p>
            )}
          </div>

          {/* Total Time Taken */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Time Taken (days) *
            </label>
            <input
              type="number"
              step="0.01"
              {...register('total_time_taken', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter total days"
            />
            {errors.total_time_taken && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.total_time_taken.message}
              </p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              {...register('start_date')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.start_date && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.start_date.message}
              </p>
            )}
          </div>

          {/* Completion Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Completion Date * (Auto-calculated)
            </label>
            <input
              type="date"
              {...register('completion_date')}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="This field is automatically calculated based on Start Date and Total Time Taken"
            />
            {errors.completion_date && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.completion_date.message}
              </p>
            )}
          </div>
        </div>

        {/* Total Payment Display */}
        {(payRate > 0 && timeTaken > 0) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-medium">
                Total Payment: ₹{totalPayment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Adding Task...' : 'Add Task'}
        </button>
      </form>
      
      {/* Add Freelancer Modal */}
      <AddFreelancerModal
        isOpen={showAddFreelancerModal}
        onClose={() => setShowAddFreelancerModal(false)}
        onAdd={handleAddFreelancer}
      />
    </div>
  );
};