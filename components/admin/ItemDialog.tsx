'use client';

import { useState, useEffect } from 'react';
import { Dialog } from './Dialog';
import { Item, createItem, updateItem, CreateItemInput } from '@/lib/actions/items';
import { X } from 'lucide-react';

interface ItemDialogProps {
  open: boolean;
  onClose: () => void;
  item?: Item | null;
}

const AVAILABLE_THEMES = [
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

const CATEGORIES = [
  'food',
  'toys',
  'school_supplies',
  'sports_equipment',
  'clothing',
  'electronics',
  'books',
  'household',
  'other',
];

export function ItemDialog({ open, onClose, item }: ItemDialogProps) {
  const [formData, setFormData] = useState<CreateItemInput>({
    name: '',
    category: 'other',
    themes: [],
    min_price: 0,
    max_price: 0,
    typical_price: 0,
    active: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        themes: item.themes,
        min_price: item.min_price,
        max_price: item.max_price,
        typical_price: item.typical_price,
        active: item.active,
      });
    } else {
      setFormData({
        name: '',
        category: 'other',
        themes: [],
        min_price: 0,
        max_price: 0,
        typical_price: 0,
        active: true,
      });
    }
    setError(null);
  }, [item, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    if (formData.themes.length === 0) {
      setError('At least one theme is required');
      return;
    }

    if (formData.min_price < 0 || formData.max_price < 0 || formData.typical_price < 0) {
      setError('Prices must be positive numbers');
      return;
    }

    if (formData.min_price > formData.max_price) {
      setError('Minimum price cannot be greater than maximum price');
      return;
    }

    if (formData.typical_price < formData.min_price || formData.typical_price > formData.max_price) {
      setError('Typical price must be between minimum and maximum price');
      return;
    }

    setIsSaving(true);
    try {
      if (item) {
        await updateItem({ ...formData, id: item.id });
      } else {
        await createItem(formData);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTheme = (theme: string) => {
    setFormData((prev) => ({
      ...prev,
      themes: prev.themes.includes(theme)
        ? prev.themes.filter((t) => t !== theme)
        : [...prev.themes, theme],
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={item ? 'Edit Item' : 'Add Item'}
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., Apple, Football, Notebook"
              disabled={isSaving}
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category <span className="text-red-600">*</span>
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSaving}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Themes <span className="text-red-600">*</span>
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {AVAILABLE_THEMES.map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => toggleTheme(theme)}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  formData.themes.includes(theme)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={isSaving}
              >
                {theme.replace(/_/g, ' ')}
                {formData.themes.includes(theme) && <X className="h-3 w-3" />}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="min_price" className="block text-sm font-medium text-gray-700">
              Min Price (£) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              id="min_price"
              step="0.01"
              min="0"
              value={formData.min_price}
              onChange={(e) => setFormData({ ...formData, min_price: parseFloat(e.target.value) || 0 })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSaving}
            />
          </div>

          <div>
            <label htmlFor="typical_price" className="block text-sm font-medium text-gray-700">
              Typical Price (£) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              id="typical_price"
              step="0.01"
              min="0"
              value={formData.typical_price}
              onChange={(e) => setFormData({ ...formData, typical_price: parseFloat(e.target.value) || 0 })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSaving}
            />
          </div>

          <div>
            <label htmlFor="max_price" className="block text-sm font-medium text-gray-700">
              Max Price (£) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              id="max_price"
              step="0.01"
              min="0"
              value={formData.max_price}
              onChange={(e) => setFormData({ ...formData, max_price: parseFloat(e.target.value) || 0 })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSaving}
            />
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
            {isSaving ? 'Saving...' : item ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
