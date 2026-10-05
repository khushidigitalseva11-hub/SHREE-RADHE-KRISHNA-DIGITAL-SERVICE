import React from 'react';
import { DynamicFormField } from '@/types/digitalSeva';
import { HelpCircle } from 'lucide-react';

interface DynamicFormRendererProps {
  fields: DynamicFormField[];
  formData: Record<string, any>;
  onChange: (fieldName: string, value: any) => void;
  errors?: Record<string, string>;
}

export const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({
  fields,
  formData,
  onChange,
  errors = {},
}) => {
  const sortedFields = [...fields].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  return (
    <div className="space-y-4">
      {sortedFields.map((field) => {
        const error = errors[field.field_name];
        const value = formData[field.field_name] ?? field.default_value ?? '';

        return (
          <div key={field.id} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                <span>{field.label_gu || field.label}</span>
                {field.label_gu && field.label && (
                  <span className="text-[11px] text-slate-400">({field.label})</span>
                )}
                {field.is_required && <span className="text-rose-400">*</span>}
              </label>

              {field.help_text && (
                <span
                  title={field.help_text}
                  className="text-slate-400 hover:text-blue-400 cursor-pointer text-xs"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            {/* Input by field_type */}
            {field.field_type === 'text' && (
              <input
                type="text"
                placeholder={field.placeholder || field.label}
                value={value}
                onChange={(e) => onChange(field.field_name, e.target.value)}
                minLength={field.min_length}
                maxLength={field.max_length}
                required={field.is_required}
                className="w-full bg-[#162035] border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
              />
            )}

            {field.field_type === 'number' && (
              <input
                type="number"
                placeholder={field.placeholder || field.label}
                value={value}
                onChange={(e) => onChange(field.field_name, e.target.value)}
                required={field.is_required}
                className="w-full bg-[#162035] border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
              />
            )}

            {field.field_type === 'date' && (
              <input
                type="date"
                value={value}
                onChange={(e) => onChange(field.field_name, e.target.value)}
                required={field.is_required}
                className="w-full bg-[#162035] border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all font-mono"
              />
            )}

            {field.field_type === 'textarea' && (
              <textarea
                rows={3}
                placeholder={field.placeholder || field.label}
                value={value}
                onChange={(e) => onChange(field.field_name, e.target.value)}
                required={field.is_required}
                className="w-full bg-[#162035] border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all resize-none"
              />
            )}

            {field.field_type === 'dropdown' && (
              <select
                value={value}
                onChange={(e) => onChange(field.field_name, e.target.value)}
                required={field.is_required}
                className="w-full bg-[#162035] border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all"
              >
                <option value="">-- પસંદ કરો (Select) --</option>
                {field.options?.map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {field.field_type === 'radio' && (
              <div className="flex flex-wrap gap-3 pt-1">
                {field.options?.map((opt, i) => (
                  <label key={i} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name={field.field_name}
                      value={opt}
                      checked={value === opt}
                      onChange={(e) => onChange(field.field_name, e.target.value)}
                      className="accent-blue-600"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {field.field_type === 'checkbox' && (
              <div className="space-y-1.5 pt-1">
                {field.options?.map((opt, i) => {
                  const currentVals = Array.isArray(value) ? value : [];
                  const isChecked = currentVals.includes(opt);
                  return (
                    <label key={i} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onChange(field.field_name, [...currentVals, opt]);
                          } else {
                            onChange(field.field_name, currentVals.filter((v: string) => v !== opt));
                          }
                        }}
                        className="rounded accent-blue-600"
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {field.field_type === 'file' && (
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onChange(field.field_name, file.name);
                  }
                }}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
              />
            )}

            {error && <p className="text-[11px] text-rose-400 mt-0.5">{error}</p>}
          </div>
        );
      })}
    </div>
  );
};
