import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChartData } from '../types';

interface ExpenditureChartProps {
  data: ChartData[];
  title: string;
  type: 'bar' | 'pie';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

export const ExpenditureChart: React.FC<ExpenditureChartProps> = ({ data, title, type }) => {
  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">
            Amount: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-gray-600">
            Percentage: {payload[0].payload.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-blue-600">
            Amount: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-gray-600">
            Percentage: {payload[0].payload.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available for the selected filters
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Items:</span>
            <span className="ml-2 font-medium">{data.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Total Amount:</span>
            <span className="ml-2 font-medium">
              {formatCurrency(data.reduce((sum, item) => sum + item.value, 0))}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Highest:</span>
            <span className="ml-2 font-medium">
              {formatCurrency(Math.max(...data.map(item => item.value)))}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Average:</span>
            <span className="ml-2 font-medium">
              {formatCurrency(data.reduce((sum, item) => sum + item.value, 0) / data.length)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};