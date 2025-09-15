import React from 'react';
import { 
  TextField, 
  Select, 
  MenuItem, 
  Checkbox, 
  FormControlLabel,
  FormControl,
  InputLabel,
  OutlinedInput,
  Chip,
  Box
} from '@mui/material';
import { UseFormReturn } from 'react-hook-form';

// All supported input types
type InputType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'textarea'
  | 'number'
  | 'tel'
  | 'date'
  | 'datetime-local'
  | 'select'
  | 'multiselect'
  | 'checkbox';

// Option for select/multiselect
interface SelectOption {
  value: string | number;
  label: string;
}

interface FormInputProps {
  name: string;
  type: InputType;
  label?: string;
  placeholder?: string;
  form: UseFormReturn<any>;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  
  // For textarea
  rows?: number;
  multiline?: boolean;
  
  // For select/multiselect
  options?: SelectOption[];
  
  // For checkbox
  size?: 'small' | 'medium';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'default';
  labelPlacement?: 'end' | 'start' | 'top' | 'bottom';
}

// Shared TextField renderer for all TextField-based inputs
const textField = (inputType: string, extraProps?: any) => (props: FormInputProps, register: any) => (
  <TextField
    type={inputType}
    placeholder={props.placeholder}
    disabled={props.disabled}
    fullWidth
    variant="outlined"
    {...extraProps}
    {...register}
  />
);

// Static input renderers object - no recreation on each render
const inputRenderers = {
  text: textField('text'),
  email: textField('email'),
  password: textField('password'),
  number: textField('number'),
  tel: textField('tel'),
  date: textField('date', { InputLabelProps: { shrink: true } }),
  'datetime-local': textField('datetime-local', { InputLabelProps: { shrink: true } }),
  textarea: (props: FormInputProps, register: any) => 
    textField('text', { 
      multiline: true, 
      rows: props.rows || 4 
    })(props, register),
  select: (props: FormInputProps, register: any) => (
    <FormControl fullWidth variant="outlined">
      <InputLabel>{props.label}</InputLabel>
      <Select
        disabled={props.disabled}
        label={props.label}
        {...register}
      >
        {props.options?.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  ),
  multiselect: (props: FormInputProps, register: any) => (
    <FormControl fullWidth variant="outlined">
      <InputLabel>{props.label}</InputLabel>
      <Select
        multiple
        disabled={props.disabled}
        label={props.label}
        input={<OutlinedInput label={props.label} />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {(selected as string[]).map((value) => {
              const option = props.options?.find(opt => opt.value === value);
              return <Chip key={value} label={option?.label || value} size="small" />;
            })}
          </Box>
        )}
        {...register}
      >
        {props.options?.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  ),
  checkbox: (props: FormInputProps, register: any) => (
    <FormControlLabel
      control={
        <Checkbox
          size={props.size}
          color={props.color}
          disabled={props.disabled}
          {...register}
        />
      }
      label={props.label}
      labelPlacement={props.labelPlacement}
    />
  ),
} as const;


const FormInput: React.FC<FormInputProps> = (props) => {
  const { name, form, type, label, required = false, className } = props;
  const { register, formState: { errors } } = form;
  const error = errors[name]?.message as string;
  const hasError = !!error;

  // Get the static renderer for this input type
  const renderInput = inputRenderers[type];
  const inputElement = renderInput(props, register(name));

  // For input types, use wrapper with absolute error positioning
  return (
    <div className={`relative flex-1 ${className || ''}`}>
      {/* Label */}
      {label && type !== 'checkbox' && (
        <label className="block font-medium text-black dark:text-white mb-2">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      {/* Input Component */}
      {inputElement}

      {/* Error Message - Absolute positioning */}
      {hasError && (
        <p className="text-xs text-destructive absolute bottom-[-18px]">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;
export type { InputType, SelectOption };