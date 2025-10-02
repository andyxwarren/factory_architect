'use client';

import { useState, useEffect } from 'react';
import { Dialog } from './Dialog';
import { ScenarioTemplate, createTemplate, updateTemplate, CreateTemplateInput } from '@/lib/actions/templates';
import { X } from 'lucide-react';

interface TemplateDialogProps {
  open: boolean;
  onClose: () => void;
  template?: ScenarioTemplate | null;
}

const THEMES = [
  'SHOPPING',
  'SCHOOL',
  'SPORTS',
  'COOKING',
  'POCKET_MONEY',
  'TRANSPORT',
  'COLLECTIONS',
  'NATURE',
  'HOUSEHOLD',
  'CELEBRATIONS',
];

const FORMATS = [
  'DIRECT_CALCULATION',
  'COMPARISON',
  'ESTIMATION',
  'VALIDATION',
  'MULTI_STEP',
  'MISSING_VALUE',
  'ORDERING',
  'PATTERN_RECOGNITION',
];

export function TemplateDialog({ open, onClose, template }: TemplateDialogProps) {
  const [formData, setFormData] = useState<CreateTemplateInput>({
    theme: 'SHOPPING',
    format: 'DIRECT_CALCULATION',
    template_text: '',
    placeholders: [],
    active: true,
  });
  const [placeholderInput, setPlaceholderInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (template) {
      setFormData({
        theme: template.theme,
        format: template.format,
        template_text: template.template_text,
        placeholders: template.placeholders,
        active: template.active,
      });
    } else {
      setFormData({
        theme: 'SHOPPING',
        format: 'DIRECT_CALCULATION',
        template_text: '',
        placeholders: [],
        active: true,
      });
    }
    setPlaceholderInput('');
    setError(null);
  }, [template, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.template_text.trim()) {
      setError('Template text is required');
      return;
    }

    setIsSaving(true);
    try {
      if (template) {
        await updateTemplate({ ...formData, id: template.id });
      } else {
        await createTemplate(formData);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const addPlaceholder = () => {
    const trimmed = placeholderInput.trim();
    if (trimmed && !formData.placeholders.includes(trimmed)) {
      setFormData({
        ...formData,
        placeholders: [...formData.placeholders, trimmed],
      });
      setPlaceholderInput('');
    }
  };

  const removePlaceholder = (placeholder: string) => {
    setFormData({
      ...formData,
      placeholders: formData.placeholders.filter((p) => p !== placeholder),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={template ? 'Edit Template' : 'Add Template'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
              Theme <span className="text-red-600">*</span>
            </label>
            <select
              id="theme"
              value={formData.theme}
              onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSaving}
            >
              {THEMES.map((theme) => (
                <option key={theme} value={theme}>
                  {theme.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="format" className="block text-sm font-medium text-gray-700">
              Format <span className="text-red-600">*</span>
            </label>
            <select
              id="format"
              value={formData.format}
              onChange={(e) => setFormData({ ...formData, format: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSaving}
            >
              {FORMATS.map((format) => (
                <option key={format} value={format}>
                  {format.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="template_text" className="block text-sm font-medium text-gray-700">
            Template Text <span className="text-red-600">*</span>
          </label>
          <textarea
            id="template_text"
            value={formData.template_text}
            onChange={(e) => setFormData({ ...formData, template_text: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g., {character} went to the {location} and bought {item} for {price}."
            rows={4}
            disabled={isSaving}
          />
          <p className="mt-1 text-xs text-gray-500">
            Use placeholders like {'{character}'}, {'{item}'}, {'{price}'} in your template
          </p>
        </div>

        <div>
          <label htmlFor="placeholder_input" className="block text-sm font-medium text-gray-700">
            Placeholders
          </label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              id="placeholder_input"
              value={placeholderInput}
              onChange={(e) => setPlaceholderInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addPlaceholder();
                }
              }}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., character, item, price"
              disabled={isSaving}
            />
            <button
              type="button"
              onClick={addPlaceholder}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isSaving}
            >
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.placeholders.map((placeholder) => (
              <span
                key={placeholder}
                className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
              >
                {placeholder}
                <button
                  type="button"
                  onClick={() => removePlaceholder(placeholder)}
                  className="hover:text-blue-900"
                  disabled={isSaving}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="active"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={isSaving}
          />
          <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
            Active (available for question generation)
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : template ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
