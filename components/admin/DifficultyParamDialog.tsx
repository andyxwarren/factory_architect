'use client';

import { useState, useEffect } from 'react';
import { Dialog } from './Dialog';
import { JsonEditor } from './JsonEditor';
import { DifficultyParameter, createDifficultyParam, updateDifficultyParam, CreateDifficultyParamInput } from '@/lib/actions/difficulty-params';

interface DifficultyParamDialogProps {
  open: boolean;
  onClose: () => void;
  param?: DifficultyParameter | null;
}

const MODELS = [
  'ADDITION',
  'SUBTRACTION',
  'MULTIPLICATION',
  'DIVISION',
  'FRACTION',
  'PERCENTAGE',
  'AREA_PERIMETER',
  'ANGLE_MEASUREMENT',
  'POSITION_DIRECTION',
];

export function DifficultyParamDialog({ open, onClose, param }: DifficultyParamDialogProps) {
  const [formData, setFormData] = useState<CreateDifficultyParamInput>({
    model_id: 'ADDITION',
    difficulty_level: '1',
    year_level: 1,
    parameters: {},
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (param) {
      setFormData({
        model_id: param.model_id,
        difficulty_level: param.difficulty_level,
        year_level: param.year_level,
        parameters: param.parameters,
      });
    } else {
      setFormData({
        model_id: 'ADDITION',
        difficulty_level: '1',
        year_level: 1,
        parameters: {},
      });
    }
    setError(null);
  }, [param, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.model_id) {
      setError('Model ID is required');
      return;
    }

    if (!formData.difficulty_level) {
      setError('Difficulty level is required');
      return;
    }

    if (formData.year_level < 1 || formData.year_level > 6) {
      setError('Year level must be between 1 and 6');
      return;
    }

    setIsSaving(true);
    try {
      if (param) {
        await updateDifficultyParam({ ...formData, id: param.id });
      } else {
        await createDifficultyParam(formData);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save parameter');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={param ? 'Edit Difficulty Parameter' : 'Add Difficulty Parameter'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="model_id" className="block text-sm font-medium text-gray-700">
              Model ID <span className="text-red-600">*</span>
            </label>
            <select
              id="model_id"
              value={formData.model_id}
              onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSaving}
            >
              {MODELS.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="difficulty_level" className="block text-sm font-medium text-gray-700">
              Difficulty Level <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="difficulty_level"
              value={formData.difficulty_level}
              onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., 1, 2.1, 3.4"
              disabled={isSaving}
            />
          </div>

          <div>
            <label htmlFor="year_level" className="block text-sm font-medium text-gray-700">
              Year Level <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              id="year_level"
              min="1"
              max="6"
              value={formData.year_level}
              onChange={(e) => setFormData({ ...formData, year_level: parseInt(e.target.value) || 1 })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSaving}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Parameters (JSON) <span className="text-red-600">*</span>
          </label>
          <div className="mt-1">
            <JsonEditor
              value={formData.parameters}
              onChange={(value) => setFormData({ ...formData, parameters: value })}
              placeholder='{\n  "min": 1,\n  "max": 10\n}'
              disabled={isSaving}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Enter model-specific parameters as JSON. The structure depends on the selected model.
          </p>
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
            {isSaving ? 'Saving...' : param ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
