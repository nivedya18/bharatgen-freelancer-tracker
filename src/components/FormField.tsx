import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = React.memo(({
  label,
  required = false,
  error,
  children,
  className = '',
  icon
}) => {
  return (
    <div className={`${className}`}>
      <label className="label-base flex items-center gap-1">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
        {required && <span className="text-red-500 text-xs">*</span>}
      </label>
      <div className="relative">
        {children}
      </div>
      {error && (
        <div className="error-text flex items-center gap-0.5">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';