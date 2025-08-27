import { FreelancerTask } from '../lib/supabase';
import { format } from 'date-fns';

export const exportToCSV = (tasks: FreelancerTask[], filename: string = 'freelancer-tasks') => {
  const headers = [
    'Task',
    'Model',
    'Language',
    'Freelancer Name',
    'Freelancer Type',
    'Pay Rate Per Day (₹)',
    'Total Time Taken (Days)',
    'Start Date',
    'Completion Date',
    'Total Payment (₹)',
    'Created At',
  ];

  const csvData = tasks.map(task => [
    task.task,
    task.model,
    task.language,
    task.freelancer_name,
    task.freelancer_type,
    task.pay_rate_per_day.toString(),
    task.total_time_taken.toString(),
    format(new Date(task.start_date), 'dd/MM/yyyy'),
    format(new Date(task.completion_date), 'dd/MM/yyyy'),
    (task.pay_rate_per_day * task.total_time_taken).toString(),
    format(new Date(task.created_at), 'dd/MM/yyyy HH:mm:ss'),
  ]);

  const csvContent = [
    headers.join(','),
    ...csvData.map(row => 
      row.map(field => 
        // Escape fields that contain commas, quotes, or newlines
        typeof field === 'string' && (field.includes(',') || field.includes('"') || field.includes('\n'))
          ? `"${field.replace(/"/g, '""')}"`
          : field
      ).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};