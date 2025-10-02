'use client';

import { useState, useEffect } from 'react';
import { Dialog } from './Dialog';
import { CuratedMapping, createMapping, updateMapping, CreateMappingInput } from '@/lib/actions/mappings';
import { getDifficultyParams, DifficultyParameter } from '@/lib/actions/difficulty-params';

interface MappingDialogProps {
  open: boolean;
  onClose: () => void;
  mapping?: CuratedMapping | null;
}

const MODELS = [
  'ADDITION',
  'SUBTRACTION',
  'MULTIPLICATION',
  'DIVISION',
  'FRACTION',
  'PERCENTAGE',
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

export function MappingDialog({ open, onClose, mapping }: MappingDialogProps) {
  const [formData, setFormData] = useState<CreateMappingInput>({
    model_id: 'ADDITION',
    difficulty_param_id: '',
    format: 'DIRECT_CALCULATION',
    theme: 'SHOPPING',
    weight: 1.0,
    active: true,
  });
  const [difficultyParams, setDifficultyParams] = useState<DifficultyParameter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadDifficultyParams();
    }
  }, [open]);

  useEffect(() => {
    if (mapping) {
      setFormData({
        model_id: mapping.model_id,
        difficulty_param_id: mapping.difficulty_param_id,
        format: mapping.format,
        theme: mapping.theme,
        weight: mapping.weight,
        active: mapping.active,
      });
    } else {
      setFormData({
        model_id: 'ADDITION',
        difficulty_param_id: '',
        format: 'DIRECT_CALCULATION',
        theme: 'SHOPPING',
        weight: 1.0,
        active: true,
      });
    }
    setError(null);
  }, [mapping, open]);

  const loadDifficultyParams = async () => {
    setIsLoading(true);
    try {
      const params = await getDifficultyParams();
      setDifficultyParams(params);
    } catch (err) {
      console.error('Failed to load difficulty parameters:', err);
      setError('Failed to load difficulty parameters');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.difficulty_param_id) {
      setError('Difficulty parameter is required');
      return;
    }

    setIsSaving(true);
    try {
      if (mapping) {
        await updateMapping({ ...formData, id: mapping.id });
      } else {
        await createMapping(formData);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save mapping');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredParams = difficultyParams.filter((p) => p.model_id === formData.model_id);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={mapping ? 'Edit Mapping' : 'Add Mapping'}
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
            <label htmlFor="model_id" className="block text-sm font-medium text-gray-700">
              Model <span className="text-red-600">*</span>
            </label>
            <select
              id="model_id"
              value={formData.model_id}
              onChange={(e) => setFormData({ ...formData, model_id: e.target.value, difficulty_param_id: '' })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSaving || isLoading}
            >
              {MODELS.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="difficulty_param_id" className="block text-sm font-medium text-gray-700">
              Difficulty Parameter <span className="text-red-600">*</span>
            </label>
            <select
              id="difficulty_param_id"
              value={formData.difficulty_param_id}
              onChange={(e) => setFormData({ ...formData, difficulty_param_id: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSaving || isLoading}
            >
              <option value="">Select difficulty...</option>
              {filteredParams.map((param) => (
                <option key={param.id} value={param.id}>
                  {param.difficulty_level} (Year {param.year_level})
                </option>
              ))}
            </select>
            {filteredParams.length === 0 && formData.model_id && (
              <p className="mt-1 text-xs text-orange-600">
                No difficulty parameters found for {formData.model_id}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
            Weight <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            id="weight"
            min="0"
            max="10"
            step="0.1"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 1.0 })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isSaving}
          />
          <p className="mt-1 text-xs text-gray-500">
            Weight affects the probability of selecting this mapping (0-10)
          </p>
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
            disabled={isSaving || isLoading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : mapping ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
