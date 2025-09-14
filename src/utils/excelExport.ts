import * as XLSX from 'xlsx';
import { FreelancerTask } from '../lib/supabase';

export const exportToExcel = (
  tasks: FreelancerTask[],
  fileName: string = 'freelancer-tasks'
) => {
  // Prepare data for Excel
  const excelData = tasks.map(task => ({
    'Task Group': task.task_group || '',
    'Task Description': task.task_description,
    'Model': task.model,
    'Language': task.language,
    'Freelancer Name': task.freelancer_name,
    'Freelancer Type': task.freelancer_type,
    'Task Status': task.task_status || 'Planned',
    'Pay Rate (₹/day)': task.pay_rate_per_day,
    'Total Days': task.total_time_taken,
    'Total Payment (₹)': task.pay_rate_per_day * task.total_time_taken,
    'Start Date': new Date(task.start_date).toLocaleDateString('en-IN'),
    'Completion Date': new Date(task.completion_date).toLocaleDateString('en-IN'),
    'Created At': new Date(task.created_at).toLocaleDateString('en-IN')
  }));

  // Create workbook and worksheet
  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tasks');

  // Set column widths for better readability
  const colWidths = [
    { wch: 20 }, // Task Group
    { wch: 40 }, // Task Description
    { wch: 12 }, // Model
    { wch: 15 }, // Language
    { wch: 20 }, // Freelancer Name
    { wch: 15 }, // Freelancer Type
    { wch: 12 }, // Task Status
    { wch: 15 }, // Pay Rate
    { wch: 12 }, // Total Days
    { wch: 15 }, // Total Payment
    { wch: 12 }, // Start Date
    { wch: 15 }, // Completion Date
    { wch: 12 }  // Created At
  ];
  ws['!cols'] = colWidths;

  // Add summary sheet with statistics
  const summaryData = [
    { 'Metric': 'Total Tasks', 'Value': tasks.length },
    { 'Metric': 'Total Payment', 'Value': `₹${tasks.reduce((sum, task) => sum + (task.pay_rate_per_day * task.total_time_taken), 0).toFixed(2)}` },
    { 'Metric': 'Total Days', 'Value': tasks.reduce((sum, task) => sum + task.total_time_taken, 0).toFixed(2) },
    { 'Metric': 'Unique Freelancers', 'Value': new Set(tasks.map(t => t.freelancer_name)).size },
    { 'Metric': 'Unique Languages', 'Value': new Set(tasks.map(t => t.language)).size },
    { 'Metric': 'Export Date', 'Value': new Date().toLocaleDateString('en-IN') }
  ];

  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  summaryWs['!cols'] = [{ wch: 20 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

  // Generate Excel file with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${fileName}-${timestamp}.xlsx`);
};