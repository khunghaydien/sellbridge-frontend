import React, { cloneElement, isValidElement } from 'react';

interface FormInputProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactElement; // Chỉ nhận 1 child element (MUI input component)
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  hint,
  required = false,
  className,
  children,
}) => {
  const hasError = !!error;

  // Clone child element và inject props cần thiết
  const enhancedChild = isValidElement(children)
    ? cloneElement(children, {
        ...(children.props as any),
        error: hasError,
        fullWidth: true,
        variant: 'outlined',
        // Xóa label prop nếu có để tránh duplicate
        label: undefined,
      } as any)
    : children;

  return (
    <div className={`relative ${className || ''}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-black dark:text-white mb-2">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      {/* Input Component (TextField, Select, etc.) */}
      {enhancedChild}

      {/* Error Message */}
      {hasError && (
        <p className="mt-1.5 text-xs text-destructive absolute bottom-[-16px]">
          {error}
        </p>
      )}

      {/* Hint Text (chỉ hiện khi không có error) */}
      {hint && !hasError && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
};

export default FormInput;