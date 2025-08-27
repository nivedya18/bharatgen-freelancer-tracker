import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, TaskFormData } from '../schemas/taskSchema';
import { useFreelancerTasks } from '../hooks/useFreelancerTasks';
import { CheckCircle, AlertCircle, Calculator } from 'lucide-react';

export const TaskForm: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const { addTask } = useFreelancerTasks();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const payRate = watch('pay_rate_per_day') || 0;
  const timeTaken = watch('total_time_taken') || 0;
  const totalPayment = payRate * timeTaken;

  const onSubmit = async (data: TaskFormData) => {
    const result = await addTask(data);
    
    if (result.success) {
      setShowSuccess(true);
      reset();
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
            <input
              type="text"
              {...register('model')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter model name"
            />
            {errors.model && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.model.message}
              </p>
            )}
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language *
            </label>
            <input
              type="text"
              {...register('language')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter language"
            />
            {errors.language && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.language.message}
              </p>
            )}
          </div>

          {/* Freelancer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Freelancer Name *
            </label>
            <input
              type="text"
              {...register('freelancer_name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter freelancer name"
            />
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
              Completion Date *
            </label>
            <input
              type="date"
              {...register('completion_date')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
    </div>
  );
};