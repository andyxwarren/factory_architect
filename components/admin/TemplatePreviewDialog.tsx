'use client';

import { Dialog } from './Dialog';
import { ScenarioTemplate } from '@/lib/actions/templates';

interface TemplatePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  template: ScenarioTemplate | null;
}

export function TemplatePreviewDialog({ open, onClose, template }: TemplatePreviewDialogProps) {
  if (!template) return null;

  // Sample data for preview
  const sampleData: Record<string, string> = {
    character: 'Sarah',
    item: 'notebook',
    price: '£2.50',
    location: 'shop',
    quantity: '3',
    total: '£7.50',
  };

  // Replace placeholders with sample data
  const previewText = template.template_text.replace(
    /\{(\w+)\}/g,
    (match, placeholder) => sampleData[placeholder] || match
  );

  return (
    <Dialog open={open} onClose={onClose} title="Template Preview" maxWidth="md">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Theme</h3>
          <p className="mt-1 text-sm text-gray-900">{template.theme}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700">Format</h3>
          <p className="mt-1 text-sm text-gray-900">{template.format}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700">Original Template</h3>
          <p className="mt-1 rounded-md bg-gray-100 p-3 text-sm text-gray-900 font-mono">
            {template.template_text}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700">Preview with Sample Data</h3>
          <p className="mt-1 rounded-md bg-blue-50 p-3 text-sm text-gray-900">
            {previewText}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700">Placeholders</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {template.placeholders.map((placeholder) => (
              <span
                key={placeholder}
                className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
              >
                {placeholder}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </Dialog>
  );
}
