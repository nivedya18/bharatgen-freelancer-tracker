import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, TaskFormData } from '../schemas/taskSchema';
import { useFreelancerTasks } from '../hooks/useFreelancerTasks';
import { useFreelancers } from '../hooks/useFreelancers';
import { AddFreelancerModal } from './AddFreelancerModal';
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
  Check
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
  { value: 'ASR', label: 'ASR' }
];

export const TaskForm: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAddFreelancerModal, setShowAddFreelancerModal] = useState(false);
  
  const { addTask } = useFreelancerTasks();
  const { freelancers, addFreelancer } = useFreelancers();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    mode: 'onChange'
  });

  const payRate = watch('pay_rate_per_day') || 0;
  const timeTaken = watch('total_time_taken') || 0;
  const startDate = watch('start_date');
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

  // Auto-calculate completion date
  useEffect(() => {
    if (startDate && timeTaken && timeTaken > 0) {
      const start = new Date(startDate);
      const completionDate = addDays(start, Math.ceil(timeTaken) - 1);
      setValue('completion_date', format(completionDate, 'yyyy-MM-dd'));
    }
  }, [startDate, timeTaken, setValue]);

  // Handle adding new freelancer
  const handleAddNewFreelancer = useCallback(() => {
    setShowAddFreelancerModal(true);
  }, []);

  const handleFreelancerAdded = useCallback(async (name: string) => {
    const result = await addFreelancer(name);
    if (result.success && result.data) {
      setValue('freelancer_name', result.data.name);
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
    
    const result = await addTask({
      ...data,
      completion_date: data.completion_date || format(new Date(), 'yyyy-MM-dd')
    });
    
    if (result.success) {
      setShowSuccess(true);
      reset();
      setTimeout(() => setShowSuccess(false), 2000);
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
      {/* Header with success indicator */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Add New Task</h2>
        {showSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 text-base font-medium rounded-full">
            <Check className="w-4 h-4" />
            Task added successfully
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Row 1: Task Description (Full Width) */}
        <FormField 
          label="Task Description" 
          required 
          error={errors.task?.message}
          icon={<FileText className="w-3 h-3" />}
        >
          <input
            {...register('task')}
            className="input-base"
            placeholder="Enter task description"
            autoFocus
          />
        </FormField>

        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

        {/* Row 2: Model, Language */}
        <div className="form-grid">
          <FormField 
            label="Model" 
            required 
            error={errors.model?.message}
            icon={<Cpu className="w-3 h-3" />}
          >
            <select {...register('model')} className={`input-base ${watch('model') ? 'text-gray-900' : 'text-gray-500'}`}>
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
            <Combobox
              options={languages}
              value={watch('language') || ''}
              onChange={(value) => setValue('language', value)}
              searchPlaceholder="Type language..."
              error={!!errors.language}
            />
          </FormField>
        </div>

        {/* Row 3: Freelancer Name, Type */}
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
            <select {...register('freelancer_type')} className={`input-base ${watch('freelancer_type') ? 'text-gray-900' : 'text-gray-500'}`}>
              <option value="" className="text-gray-500">Select type</option>
              <option value="Linguist">Linguist</option>
              <option value="Language Expert">Language Expert</option>
            </select>
          </FormField>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

        {/* Row 4: Pay Rate, Total Days */}
        <div className="form-grid">
          <FormField 
            label="Pay Rate (₹/day)" 
            required 
            error={errors.pay_rate_per_day?.message}
            icon={<IndianRupee className="w-3 h-3" />}
          >
            <input
              type="number"
              step="0.01"
              {...register('pay_rate_per_day', { valueAsNumber: true })}
              className="input-base input-numeric"
              placeholder="0.00"
            />
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
              className="input-base input-numeric"
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
              className={`input-base ${watch('start_date') ? 'text-gray-900' : 'text-gray-500'}`}
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
              className={`input-base bg-gray-50 ${watch('completion_date') ? 'text-gray-900' : 'text-gray-500'}`}
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
    </div>
  );
};