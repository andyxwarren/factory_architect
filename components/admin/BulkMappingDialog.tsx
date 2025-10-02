'use client';

import { useState } from 'react';
import { Dialog } from './Dialog';
import { bulkGenerateMappings } from '@/lib/actions/mappings';
import { Loader2 } from 'lucide-react';

interface BulkMappingDialogProps {
  open: boolean;
  onClose: () => void;
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

export function BulkMappingDialog({ open, onClose }: BulkMappingDialogProps) {
  const [modelId, setModelId] = useState('ADDITION');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const data = await bulkGenerateMappings({ model_id: modelId });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate mappings');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setModelId('ADDITION');
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} title="Bulk Generate Mappings" maxWidth="md">
      <div className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {result && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
            Successfully generated {result.length} mapping{result.length !== 1 ? 's' : ''} for {modelId}
          </div>
        )}

        <div>
          <label htmlFor="model_id" className="block text-sm font-medium text-gray-700">
            Select Model <span className="text-red-600">*</span>
          </label>
          <select
            id="model_id"
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isGenerating}
          >
            {MODELS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-md bg-blue-50 p-4">
          <h4 className="text-sm font-medium text-blue-900">What happens next?</h4>
          <ul className="mt-2 space-y-1 text-sm text-blue-800">
            <li>• Creates default mappings for all difficulty parameters of {modelId}</li>
            <li>• Uses DIRECT_CALCULATION format and SHOPPING theme</li>
            <li>• Sets weight to 1.0 for all mappings</li>
            <li>• Skips existing mappings (no duplicates)</li>
          </ul>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isGenerating}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            {result ? 'Done' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
            {isGenerating ? 'Generating...' : 'Generate Mappings'}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
