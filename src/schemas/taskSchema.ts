import { z } from 'zod';

export const taskSchema = z.object({
  task: z.string().min(1, 'Task is required'),
  model: z.string().min(1, 'Model is required'),
  language: z.string().min(1, 'Language is required'),
  freelancer_name: z.string().min(1, 'Freelancer name is required'),
  freelancer_type: z.enum(['Linguist', 'Language Expert']),
  pay_rate_per_day: z.number().min(0.01, 'Pay rate must be greater than 0'),
  total_time_taken: z.number().min(0.01, 'Time taken must be greater than 0'),
  start_date: z.string().min(1, 'Start date is required'),
  completion_date: z.string().min(1, 'Completion date is required'),
}).refine((data) => {
  const startDate = new Date(data.start_date);
  const completionDate = new Date(data.completion_date);
  return completionDate >= startDate;
}, {
  message: 'Completion date must be after or equal to start date',
  path: ['completion_date'],
});

export type TaskFormData = z.infer<typeof taskSchema>;