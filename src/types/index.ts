export interface TaskFormData {
  task_group?: string;
  task_description: string;
  model: string;
  language: string;
  freelancer_name: string;
  freelancer_type: 'Linguist' | 'Language Expert' | '';
  pay_rate_per_day: number;
  total_time_taken: number;
  start_date: string;
  completion_date: string;
}

export interface FilterState {
  dateRange: {
    start: string;
    end: string;
  };
  freelancer_name: string | string[];
  language: string | string[];
  model: string | string[];
  freelancer_type: string;
  search: string;
}

export interface ChartData {
  name: string;
  value: number;
  percentage: number;
}

export interface InvoiceData {
  freelancer_name: string;
  tasks: Array<{
    task_group?: string;
    task: string;
    model: string;
    language: string;
    start_date: string;
    completion_date: string;
    pay_rate_per_day: number;
    total_time_taken: number;
    total_payment: number;
  }>;
  total_amount: number;
  date_range: {
    start: string;
    end: string;
  };
}