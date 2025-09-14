import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, TaskFormData } from '../schemas/taskSchema';
import { FreelancerTask, FreelancerTaskInsert, FreelancerInsert } from '../lib/supabase';
import { useFreelancers } from '../hooks/useFreelancers';
import { FormField } from './FormField';
import { Combobox, ComboboxOption } from './Combobox';
import { AddFreelancerModal } from './AddFreelancerModal';
import {
  X,
  FileText,
  Globe,
  User,
  Calendar,
  IndianRupee,
  Clock,
  Cpu,
  Save
} from 'lucide-react';
import { addDays, format } from 'date-fns';

interface EditTaskModalProps {
  task: FreelancerTask | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<FreelancerTaskInsert>) => Promise<any>;
}

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

const taskGroups: ComboboxOption[] = [
  { value: 'Group A', label: 'Group A' },
  { value: 'Group B', label: 'Group B' }
];

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ 
  task, 
  isOpen, 
  onClose, 
  onUpdate 
}) => {
  const [showAddFreelancerModal, setShowAddFreelancerModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { freelancers, addFreelancer } = useFreelancers();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    mode: 'onChange'
  });

  // Convert freelancers to ComboboxOptions
  const freelancerOptions: ComboboxOption[] = useMemo(() => 
    freelancers.map(f => ({ 
      value: f.name, 
      label: f.name,
      id: f.id 
    })),
    [freelancers]
  );

  // Reset form when task changes
  useEffect(() => {
    if (task && isOpen) {
      reset({
        task_group: task.task_group || '',
        task_description: task.task_description,
        model: task.model,
        language: task.language,
        freelancer_name: task.freelancer_name,
        freelancer_type: task.freelancer_type as 'Linguist' | 'Language Expert',
        pay_rate_per_day: task.pay_rate_per_day,
        total_time_taken: task.total_time_taken,
        start_date: task.start_date,
        completion_date: task.completion_date
      });
    }
  }, [task, isOpen, reset]);

  // Watch values for calculations
  const payRate = watch('pay_rate_per_day') || 0;
  const timeTaken = watch('total_time_taken') || 0;
  const startDate = watch('start_date');
  const totalPayment = payRate * timeTaken;

  // Auto-calculate completion date
  useEffect(() => {
    if (startDate && timeTaken && timeTaken > 0) {
      const start = new Date(startDate);
      const completionDate = addDays(start, Math.ceil(timeTaken) - 1);
      setValue('completion_date', format(completionDate, 'yyyy-MM-dd'));
    }
  }, [startDate, timeTaken, setValue]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !showAddFreelancerModal) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, showAddFreelancerModal, onClose]);

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
    if (!task) return;
    
    setUpdating(true);
    
    // Ensure completion_date is set
    if (data.start_date && data.total_time_taken && !data.completion_date) {
      const start = new Date(data.start_date);
      const completionDate = addDays(start, Math.ceil(data.total_time_taken) - 1);
      data.completion_date = format(completionDate, 'yyyy-MM-dd');
    }

    try {
      const result = await onUpdate(task.id, {
        ...data,
        freelancer_type: data.freelancer_type as 'Linguist' | 'Language Expert',
        completion_date: data.completion_date || task.completion_date
      });
      
      if (result.success) {
        onClose();
      } else {
        alert('Failed to update task');
      }
    } catch (error) {
      alert('An error occurred while updating the task');
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <>
      {/* Modal Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Task</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Task Group Field */}
              <FormField
                label="Task Group"
                error={errors.task_group?.message}
                icon={<FileText className="w-5 h-5" />}
              >
                <Combobox
                  options={taskGroups}
                  value={watch('task_group') || ''}
                  onChange={(value) => setValue('task_group', value)}
                  placeholder="Select or type group"
                />
              </FormField>

              {/* Task Description Field */}
              <FormField
                label="Task Description"
                error={errors.task_description?.message}
                icon={<FileText className="w-5 h-5" />}
              >
                <input
                  type="text"
                  {...register('task_description')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Enter task description"
                />
              </FormField>

              {/* Freelancer and Type */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Freelancer"
                  error={errors.freelancer_name?.message}
                  icon={<User className="w-5 h-5" />}
                >
                  <Combobox
                    options={freelancerOptions}
                    value={watch('freelancer_name')}
                    onChange={(value) => setValue('freelancer_name', value)}
                    placeholder="Select freelancer"
                    onAddNew={handleAddNewFreelancer}
                  />
                </FormField>

                <FormField
                  label="Freelancer Type"
                  error={errors.freelancer_type?.message}
                  icon={<User className="w-5 h-5" />}
                >
                  <select
                    {...register('freelancer_type')}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  >
                    <option value="">Select type</option>
                    <option value="Linguist">Linguist</option>
                    <option value="Language Expert">Language Expert</option>
                  </select>
                </FormField>
              </div>

              {/* Model and Language */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Model"
                  error={errors.model?.message}
                  icon={<Cpu className="w-5 h-5" />}
                >
                  <Combobox
                    options={models}
                    value={watch('model')}
                    onChange={(value) => setValue('model', value)}
                    placeholder="Select model"
                  />
                </FormField>

                <FormField
                  label="Language"
                  error={errors.language?.message}
                  icon={<Globe className="w-5 h-5" />}
                >
                  <Combobox
                    options={languages}
                    value={watch('language')}
                    onChange={(value) => setValue('language', value)}
                    placeholder="Select language"
                  />
                </FormField>
              </div>

              {/* Pay Rate and Time */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Pay Rate per Day (₹)"
                  error={errors.pay_rate_per_day?.message}
                  icon={<IndianRupee className="w-5 h-5" />}
                >
                  <input
                    type="number"
                    step="0.01"
                    {...register('pay_rate_per_day', { valueAsNumber: true })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Enter daily rate"
                  />
                </FormField>

                <FormField
                  label="Total Time Taken (days)"
                  error={errors.total_time_taken?.message}
                  icon={<Clock className="w-5 h-5" />}
                >
                  <input
                    type="number"
                    step="0.01"
                    {...register('total_time_taken', { valueAsNumber: true })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Enter days"
                  />
                </FormField>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Start Date"
                  error={errors.start_date?.message}
                  icon={<Calendar className="w-5 h-5" />}
                >
                  <input
                    type="date"
                    {...register('start_date')}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                </FormField>

                <FormField
                  label="Completion Date"
                  error={errors.completion_date?.message}
                  icon={<Calendar className="w-5 h-5" />}
                >
                  <input
                    type="date"
                    {...register('completion_date')}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    readOnly
                  />
                </FormField>
              </div>

              {/* Total Payment Display */}
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex justify-between items-center">
                  <span className="text-orange-900 font-medium">Total Payment</span>
                  <span className="text-2xl font-bold text-orange-600">
                    ₹{totalPayment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isValid || updating}
                  className="px-6 py-2.5 rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {updating ? 'Updating...' : 'Update Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Add Freelancer Modal */}
      <AddFreelancerModal
        isOpen={showAddFreelancerModal}
        onClose={() => setShowAddFreelancerModal(false)}
        onAdd={handleFreelancerAdded}
      />
    </>
  );
};