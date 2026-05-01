import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  rows?: number;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  rows,
}) => {
  const isTextarea = type === 'textarea' || rows !== undefined;

  return (
    <div className="form-field">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      {isTextarea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          rows={rows || 4}
          className={`form-input ${error ? 'error' : ''}`}
          required={required}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className={`form-input ${error ? 'error' : ''}`}
          required={required}
        />
      )}
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};
