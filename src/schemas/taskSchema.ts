import { z } from 'zod';

export const taskSchema = z.object({
  task_group: z.string().optional(),
  task_description: z.string().min(1, 'Task description is required'),
  model: z.string().min(1, 'Model is required'),
  language: z.string().min(1, 'Language is required'),
  freelancer_name: z.string().min(1, 'Freelancer name is required'),
  freelancer_type: z.enum(['Linguist', 'Language Expert']).or(z.literal('')).refine(val => val !== '', {
    message: 'Freelancer type is required'
  }),
  pay_rate_per_day: z.number().min(0.01, 'Pay rate must be greater than 0'),
  total_time_taken: z.number().min(0.01, 'Time taken must be greater than 0'),
  start_date: z.string().min(1, 'Start date is required'),
  completion_date: z.string().optional(),
  task_status: z.enum(['Planned', 'Ongoing', 'Completed']).optional().default('Planned'),
}).refine((data) => {
  // Completion date will be auto-calculated if both start_date and total_time_taken are present
  // Only validate if completion_date is actually provided
  if (data.start_date && data.total_time_taken && !data.completion_date) {
    // This is fine - it will be calculated
    return true;
  }
  
  // If completion date is provided, ensure it's valid
  if (data.completion_date && data.start_date) {
    const startDate = new Date(data.start_date);
    const completionDate = new Date(data.completion_date);
    return completionDate >= startDate;
  }
  
  // Require completion date if we can't auto-calculate it
  return !!data.completion_date;
}, {
  message: 'Completion date must be after or equal to start date',
  path: ['completion_date'],
});

export type TaskFormData = z.infer<typeof taskSchema>;