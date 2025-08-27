import { useState, useEffect } from 'react';
import { TaskForm } from './components/TaskForm';
import { FilterPanel } from './components/FilterPanel';
import { TaskTable } from './components/TaskTable';
import { ExpenditureChart } from './components/ExpenditureChart';
import { InvoiceGenerator } from './components/InvoiceGenerator';
import { useFreelancerTasks } from './hooks/useFreelancerTasks';
import { FilterState, ChartData } from './types';
import { exportToCSV } from './utils/csvExport';
import { BarChart3, FileText, Database } from 'lucide-react';

const initialFilters: FilterState = {
  dateRange: { start: '', end: '' },
  freelancer_name: '',
  language: '',
  model: '',
  freelancer_type: '',
  search: '',
};

function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'dashboard'>('form');
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const { tasks, loading, fetchTasks, getUniqueValues } = useFreelancerTasks();

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchTasks(filters);
    }
  }, [activeTab, filters]);

  const handleExportCSV = () => {
    exportToCSV(tasks, 'freelancer-tasks');
  };

  const getLanguageExpenditureData = (): ChartData[] => {
    const languageMap = new Map<string, number>();
    
    tasks.forEach(task => {
      const amount = task.pay_rate_per_day * task.total_time_taken;
      languageMap.set(task.language, (languageMap.get(task.language) || 0) + amount);
    });

    const total = Array.from(languageMap.values()).reduce((sum, value) => sum + value, 0);
    
    return Array.from(languageMap.entries()).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
    }));
  };

  const getModelExpenditureData = (): ChartData[] => {
    const modelMap = new Map<string, number>();
    
    tasks.forEach(task => {
      const amount = task.pay_rate_per_day * task.total_time_taken;
      modelMap.set(task.model, (modelMap.get(task.model) || 0) + amount);
    });

    const total = Array.from(modelMap.values()).reduce((sum, value) => sum + value, 0);
    
    return Array.from(modelMap.entries()).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
    }));
  };

  const tabs = [
    { id: 'form', label: 'Add Task', icon: FileText },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">
                Freelancer Task Management
              </h1>
            </div>
            
            <nav className="flex space-x-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'form' | 'dashboard')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'form' ? (
          <TaskForm />
        ) : (
          <div className="space-y-6">
            <FilterPanel filters={filters} onFiltersChange={setFilters} />
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <TaskTable tasks={tasks} onExportCSV={handleExportCSV} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ExpenditureChart
                    data={getLanguageExpenditureData()}
                    title="Language-wise Expenditure"
                    type="bar"
                  />
                  <ExpenditureChart
                    data={getModelExpenditureData()}
                    title="Model-wise Expenditure"
                    type="pie"
                  />
                </div>
                
                <InvoiceGenerator
                  tasks={tasks}
                  freelancers={getUniqueValues('freelancer_name')}
                />
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;