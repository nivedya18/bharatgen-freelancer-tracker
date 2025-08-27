import React from 'react';
import { AlertCircle, Check } from 'lucide-react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  success?: boolean;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = React.memo(({
  label,
  required = false,
  error,
  success,
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
        {success && !error && (
          <Check className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-green-500" />
        )}
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