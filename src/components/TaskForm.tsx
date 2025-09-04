import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, TaskFormData } from '../schemas/taskSchema';
import { useFreelancerTasks } from '../hooks/useFreelancerTasks';
import { useFreelancers } from '../hooks/useFreelancers';
import { useRateCard } from '../hooks/useRateCard';
import { FreelancerInsert } from '../lib/supabase';
import { AddFreelancerModal } from './AddFreelancerModal';
import { RateCardModal } from './RateCardModal';
import { ManageFreelancersModal } from './ManageFreelancersModal';
import { FormField } from './FormField';
import { Combobox, ComboboxOption } from './Combobox';
import { 
  FileText, 
  Globe, 
  User, 
  Calendar, 
  IndianRupee, 
  Clock,
  Cpu,
  Check,
  CreditCard,
  Users
} from 'lucide-react';
import { addDays, format } from 'date-fns';

const languages: ComboboxOption[] = [
  'Assamese', 'Bengali', 'English', 'Gujarati', 'Hindi', 'Kannada',
  'Maithili', 'Malayalam', 'Marathi', 'Nepali', 'Odia', 'Punjabi',
  'Sanskrit', 'Sindhi', 'Tamil', 'Telugu'
].map(lang => ({ value: lang, label: lang }));

const models: ComboboxOption[] = [
  { value: 'Text LLM', label: 'Text LLM' },
  { value: 'TTS', label: 'TTS' },
  { value: 'ASR', label: 'ASR' },
  { value: 'Others', label: 'Others' }
];

export const TaskForm: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAddFreelancerModal, setShowAddFreelancerModal] = useState(false);
  const [showRateCardModal, setShowRateCardModal] = useState(false);
  const [showManageFreelancersModal, setShowManageFreelancersModal] = useState(false);
  
  const { addTask } = useFreelancerTasks();
  const { freelancers, addFreelancer } = useFreelancers();
  const { rates } = useRateCard();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    trigger,
    formState: { errors, isSubmitting, isValid },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    mode: 'onChange'
  });

  const payRate = watch('pay_rate_per_day') || 0;
  const timeTaken = watch('total_time_taken') || 0;
  const startDate = watch('start_date');
  const freelancerName = watch('freelancer_name');
  const freelancerType = watch('freelancer_type');
  const taskGroup = watch('task_group');
  const totalPayment = payRate * timeTaken;

  // Convert freelancers to ComboboxOptions
  const freelancerOptions: ComboboxOption[] = useMemo(() => 
    freelancers.map(f => ({ 
      value: f.name, 
      label: f.name,
      id: f.id 
    })),
    [freelancers]
  );

  // Get selected freelancer's details
  const selectedFreelancer = useMemo(() => 
    freelancers.find(f => f.name === freelancerName),
    [freelancers, freelancerName]
  );

  // Get available languages for the selected freelancer
  const availableLanguages = useMemo(() => {
    if (!selectedFreelancer?.language || !Array.isArray(selectedFreelancer.language)) {
      return languages;
    }
    
    // If freelancer has specific languages, filter the options
    if (selectedFreelancer.language.length > 0) {
      return languages.filter(lang => 
        selectedFreelancer.language?.includes(lang.value)
      );
    }
    
    return languages;
  }, [selectedFreelancer]);


  // Get the appropriate rate from rate card
  const rateFromCard = useMemo(() => {
    if (!freelancerType || !taskGroup) return null;
    
    const key = `${freelancerType === 'Linguist' ? 'linguist' : 'expert'}_${taskGroup === 'Group A' ? 'group_a' : 'group_b'}`;
    return rates[key as keyof typeof rates] || null;
  }, [freelancerType, taskGroup, rates]);

  // Check if pay rate should be auto-populated from rate card
  const isPayRateAutoPopulated = useMemo(() => {
    return !!rateFromCard && rateFromCard > 0;
  }, [rateFromCard]);

  // Auto-populate freelancer type and language when freelancer is selected
  useEffect(() => {
    if (selectedFreelancer) {
      // Auto-populate freelancer type if available
      if (selectedFreelancer.freelancer_type) {
        setValue('freelancer_type', selectedFreelancer.freelancer_type);
        trigger('freelancer_type');
      }
      
      // Auto-populate language if available
      if (selectedFreelancer.language && Array.isArray(selectedFreelancer.language)) {
        // If only one language, auto-select it
        if (selectedFreelancer.language.length === 1) {
          setValue('language', selectedFreelancer.language[0]);
          trigger('language');
        }
        // If multiple languages, clear the field so user must select
        else if (selectedFreelancer.language.length > 1) {
          setValue('language', '');
        }
      }
    } else if (!freelancerName) {
      // Clear freelancer type and language when freelancer name is cleared
      setValue('freelancer_type', '' as any);
      setValue('language', '');
    }
  }, [selectedFreelancer, freelancerName, setValue, trigger]);

  // Auto-populate pay rate from rate card when freelancer type and task group are selected
  useEffect(() => {
    if (isPayRateAutoPopulated && rateFromCard) {
      setValue('pay_rate_per_day', rateFromCard);
      trigger('pay_rate_per_day');
    } else if (!freelancerName || !taskGroup) {
      // Clear pay rate when either freelancer name or task group is cleared
      setValue('pay_rate_per_day', 0);
    }
  }, [isPayRateAutoPopulated, rateFromCard, freelancerName, taskGroup, setValue, trigger]);

  // Auto-calculate completion date
  useEffect(() => {
    if (startDate && timeTaken && timeTaken > 0) {
      const start = new Date(startDate);
      const completionDate = addDays(start, Math.ceil(timeTaken) - 1);
      setValue('completion_date', format(completionDate, 'yyyy-MM-dd'));
      // Trigger revalidation after setting the completion date to fix race condition
      trigger('completion_date');
    }
  }, [startDate, timeTaken, setValue, trigger]);

  // Handle adding new freelancer
  const handleAddNewFreelancer = useCallback(() => {
    setShowAddFreelancerModal(true);
  }, []);

  const handleFreelancerAdded = useCallback(async (freelancer: Partial<FreelancerInsert>) => {
    const result = await addFreelancer(freelancer);
    if (result.success && result.data) {
      setValue('freelancer_name', result.data.name);
      // If the freelancer has a type, set it in the form too
      if (result.data.freelancer_type) {
        setValue('freelancer_type', result.data.freelancer_type);
      }
      // If the freelancer has languages, set the first one in the form
      const langs = Array.isArray(result.data.language) ? result.data.language : [];
      if (langs.length > 0) {
        setValue('language', langs[0]);
      }
      setShowAddFreelancerModal(false);
    }
    return result;
  }, [addFreelancer, setValue]);

  const onSubmit = async (data: TaskFormData) => {
    // Ensure completion_date is set if it can be calculated
    if (data.start_date && data.total_time_taken && !data.completion_date) {
      const start = new Date(data.start_date);
      const completionDate = addDays(start, Math.ceil(data.total_time_taken) - 1);
      data.completion_date = format(completionDate, 'yyyy-MM-dd');
    }
    
    // Ensure freelancer_type is valid
    const submitData = {
      ...data,
      freelancer_type: data.freelancer_type as 'Linguist' | 'Language Expert',
      completion_date: data.completion_date || format(new Date(), 'yyyy-MM-dd')
    };
    
    const result = await addTask(submitData);
    
    if (result.success) {
      setShowSuccess(true);
      reset();
      // Refresh the page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  // Keyboard shortcut for submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        handleSubmit(onSubmit)();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit]);

  return (
    <div className="card-compact max-w-5xl mx-auto">
      {/* Header with rate card button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold text-gray-900">Add New Task</h2>
          <button
            type="button"
            onClick={() => setShowRateCardModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            Rate Card
          </button>
          <button
            type="button"
            onClick={() => setShowManageFreelancersModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Users className="w-4 h-4" />
            Manage Freelancers
          </button>
        </div>
      </div>

      {/* Success Popup Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 transform scale-100 animate-bounce-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600">Task has been added successfully</p>
              <p className="text-sm text-gray-500 mt-2">Refreshing...</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Row 1: Task Group and Task Description */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField 
            label="Task Group" 
            error={errors.task_group?.message}
            icon={<FileText className="w-3 h-3" />}
          >
            <select 
              {...register('task_group')} 
              className={`input-base ${watch('task_group') ? 'text-gray-900 border-green-500' : 'text-gray-500'}`}
            >
              <option value="" className="text-gray-500">Select group</option>
              <option value="Group A">Group A</option>
              <option value="Group B">Group B</option>
            </select>
          </FormField>
          <div className="md:col-span-2">
            <FormField 
              label="Task Description" 
              required 
              error={errors.task_description?.message}
              icon={<FileText className="w-3 h-3" />}
            >
              <input
                {...register('task_description')}
                className={`input-base ${watch('task_description') ? 'border-green-500' : ''}`}
                placeholder="Enter task description"
                autoFocus
              />
            </FormField>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

        {/* Row 2: Freelancer Name, Type */}
        <div className="form-grid">
          <FormField 
            label="Freelancer Name" 
            required 
            error={errors.freelancer_name?.message}
            icon={<User className="w-3 h-3" />}
          >
            <Combobox
              options={freelancerOptions}
              value={watch('freelancer_name') || ''}
              onChange={(value) => setValue('freelancer_name', value)}
              searchPlaceholder="Type name..."
              error={!!errors.freelancer_name}
              success={!!watch('freelancer_name') && !errors.freelancer_name}
              onAddNew={handleAddNewFreelancer}
              addNewLabel="Add freelancer"
            />
          </FormField>

          <FormField 
            label="Freelancer Type" 
            required 
            error={errors.freelancer_type?.message}
            icon={<User className="w-3 h-3" />}
          >
            <select 
              {...register('freelancer_type')} 
              className={`input-base ${watch('freelancer_type') ? 'text-gray-900 border-green-500' : 'text-gray-500'} ${!freelancerName || selectedFreelancer ? 'bg-gray-50' : ''}`}
              disabled={!freelancerName || !!selectedFreelancer}
            >
              <option value="" className="text-gray-500">
                {!freelancerName ? "Select freelancer name first" : "Select type"}
              </option>
              <option value="Linguist">Linguist</option>
              <option value="Language Expert">Language Expert</option>
            </select>
          </FormField>
        </div>

        {/* Row 3: Model, Language */}
        <div className="form-grid">
          <FormField 
            label="Model" 
            required 
            error={errors.model?.message}
            icon={<Cpu className="w-3 h-3" />}
          >
            <select {...register('model')} className={`input-base ${watch('model') ? 'text-gray-900 border-green-500' : 'text-gray-500'}`}>
              <option value="" className="text-gray-500">Select model</option>
              {models.map(model => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField 
            label="Language" 
            required 
            error={errors.language?.message}
            icon={<Globe className="w-3 h-3" />}
          >
            {!freelancerName ? (
              // Show disabled dropdown when no freelancer is selected
              <select 
                {...register('language')} 
                className="input-base bg-gray-50 text-gray-500"
                disabled={true}
              >
                <option value="" className="text-gray-500">Select freelancer name first</option>
              </select>
            ) : selectedFreelancer?.language && selectedFreelancer.language.length > 1 ? (
              // Simple dropdown when freelancer has multiple languages
              <select 
                {...register('language')} 
                className={`input-base ${watch('language') ? 'text-gray-900 border-green-500' : 'text-gray-500'}`}
              >
                <option value="" className="text-gray-500">Select from freelancer's languages...</option>
                {selectedFreelancer.language.map(lang => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            ) : selectedFreelancer?.language && selectedFreelancer.language.length === 1 ? (
              // Auto-populated single language (read-only)
              <input
                type="text"
                value={selectedFreelancer.language[0]}
                readOnly
                className="input-base bg-gray-50 text-gray-900 cursor-not-allowed border-green-500"
                {...register('language')}
              />
            ) : (
              // Combobox for when freelancer has no specific languages (shouldn't happen based on requirements)
              <Combobox
                options={availableLanguages}
                value={watch('language') || ''}
                onChange={(value) => setValue('language', value)}
                searchPlaceholder="Type language..."
                error={!!errors.language}
                success={!!watch('language') && !errors.language}
                disabled={false}
              />
            )}
          </FormField>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

        {/* Row 4: Pay Rate, Total Days */}
        <div className="form-grid">
          <FormField 
            label={`Pay Rate (₹/day)${isPayRateAutoPopulated ? ' - Auto from Rate Card' : ''}`}
            required 
            error={errors.pay_rate_per_day?.message}
            icon={<IndianRupee className="w-3 h-3" />}
          >
            {!freelancerName || !taskGroup ? (
              // Show disabled dropdown when prerequisites aren't met
              <select 
                className="input-base bg-gray-50 text-gray-500"
                disabled={true}
              >
                <option value="" className="text-gray-500">
                  {!freelancerName 
                    ? "Select freelancer name first" 
                    : "Select task group first"}
                </option>
              </select>
            ) : isPayRateAutoPopulated ? (
              // Show read-only input when auto-populated from rate card
              <input
                type="number"
                step="0.01"
                {...register('pay_rate_per_day', { valueAsNumber: true })}
                className="input-base input-numeric bg-gray-50 cursor-not-allowed text-gray-900 border-green-500"
                value={rateFromCard || 0}
                readOnly={true}
              />
            ) : (
              // Show editable input when manual entry is needed
              <input
                type="number"
                step="0.01"
                {...register('pay_rate_per_day', { valueAsNumber: true })}
                className={`input-base input-numeric ${watch('pay_rate_per_day') > 0 ? 'border-green-500' : ''}`}
                placeholder="0.00"
              />
            )}
          </FormField>

          <FormField 
            label="Total Days" 
            required 
            error={errors.total_time_taken?.message}
            icon={<Clock className="w-3 h-3" />}
          >
            <input
              type="number"
              step="0.01"
              {...register('total_time_taken', { valueAsNumber: true })}
              className={`input-base input-numeric ${watch('total_time_taken') > 0 ? 'border-green-500' : ''}`}
              placeholder="0.00"
            />
          </FormField>
        </div>

        {/* Row 5: Start Date, Completion Date */}
        <div className="form-grid">
          <FormField 
            label="Start Date" 
            required 
            error={errors.start_date?.message}
            icon={<Calendar className="w-3 h-3" />}
          >
            <input
              type="date"
              {...register('start_date')}
              className={`input-base ${watch('start_date') ? 'text-gray-900 border-green-500' : 'text-gray-500'}`}
            />
          </FormField>

          <FormField 
            label="Completion Date (Auto-calculated)" 
            required 
            error={errors.completion_date?.message}
            icon={<Calendar className="w-3 h-3" />}
          >
            <input
              type="date"
              {...register('completion_date')}
              readOnly
              className={`input-base bg-gray-50 ${watch('completion_date') ? 'text-gray-900 border-green-500' : 'text-gray-500'}`}
            />
          </FormField>
        </div>

        {/* Total Payment Display */}
        {totalPayment > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-gray-700">Total Payment</span>
              <span className="text-2xl font-semibold font-mono" style={{color: '#05539C'}}>
                ₹{totalPayment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className={`
              btn-base btn-primary w-full font-medium
              ${isSubmitting || !isValid ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isSubmitting ? 'Adding Task...' : 'Add Task'}
            {!isSubmitting && <span className="text-sm ml-2 opacity-75">(Ctrl+Enter)</span>}
          </button>
        </div>
      </form>

      {/* Add Freelancer Modal */}
      <AddFreelancerModal
        isOpen={showAddFreelancerModal}
        onClose={() => {
          setShowAddFreelancerModal(false);
        }}
        onAdd={handleFreelancerAdded}
      />

      {/* Rate Card Modal */}
      <RateCardModal
        isOpen={showRateCardModal}
        onClose={() => setShowRateCardModal(false)}
      />

      {/* Manage Freelancers Modal */}
      <ManageFreelancersModal
        isOpen={showManageFreelancersModal}
        onClose={() => setShowManageFreelancersModal(false)}
      />
    </div>
  );
};
