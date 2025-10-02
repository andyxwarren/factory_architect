'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, GitMerge, Wand2 } from 'lucide-react';
import { CuratedMapping, deleteMapping, toggleMappingActive } from '@/lib/actions/mappings';
import { MappingDialog } from './MappingDialog';
import { BulkMappingDialog } from './BulkMappingDialog';
import { DeleteConfirm } from './DeleteConfirm';
import { EmptyState } from './EmptyState';

interface MappingTableProps {
  mappings: CuratedMapping[];
}

export function MappingTable({ mappings }: MappingTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<CuratedMapping | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterModel, setFilterModel] = useState<string>('');
  const [filterFormat, setFilterFormat] = useState<string>('');
  const [filterTheme, setFilterTheme] = useState<string>('');

  const handleEdit = (mapping: CuratedMapping) => {
    setSelectedMapping(mapping);
    setDialogOpen(true);
  };

  const handleDelete = (mapping: CuratedMapping) => {
    setSelectedMapping(mapping);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedMapping) return;

    setIsDeleting(true);
    try {
      await deleteMapping(selectedMapping.id);
      setDeleteDialogOpen(false);
      setSelectedMapping(null);
    } catch (error) {
      console.error('Failed to delete mapping:', error);
      alert('Failed to delete mapping. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (mapping: CuratedMapping) => {
    try {
      await toggleMappingActive(mapping.id, !mapping.active);
    } catch (error) {
      console.error('Failed to toggle mapping:', error);
      alert('Failed to update mapping status. Please try again.');
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedMapping(null);
  };

  const uniqueModels = Array.from(new Set(mappings.map((m) => m.model_id))).sort();
  const uniqueFormats = Array.from(new Set(mappings.map((m) => m.format))).sort();
  const uniqueThemes = Array.from(new Set(mappings.map((m) => m.theme))).sort();

  const filteredMappings = mappings.filter((mapping) => {
    if (filterModel && mapping.model_id !== filterModel) return false;
    if (filterFormat && mapping.format !== filterFormat) return false;
    if (filterTheme && mapping.theme !== filterTheme) return false;
    return true;
  });

  if (mappings.length === 0) {
    return (
      <EmptyState
        icon={GitMerge}
        title="No mappings yet"
        description="Get started by creating mappings or using bulk generation"
        action={{
          label: 'Add Mapping',
          onClick: () => setDialogOpen(true),
        }}
      />
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-4">
            <div>
              <label htmlFor="filter-model" className="block text-sm font-medium text-gray-700">
                Model
              </label>
              <select
                id="filter-model"
                value={filterModel}
                onChange={(e) => setFilterModel(e.target.value)}
                className="mt-1 block rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Models</option>
                {uniqueModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-format" className="block text-sm font-medium text-gray-700">
                Format
              </label>
              <select
                id="filter-format"
                value={filterFormat}
                onChange={(e) => setFilterFormat(e.target.value)}
                className="mt-1 block rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Formats</option>
                {uniqueFormats.map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-theme" className="block text-sm font-medium text-gray-700">
                Theme
              </label>
              <select
                id="filter-theme"
                value={filterTheme}
                onChange={(e) => setFilterTheme(e.target.value)}
                className="mt-1 block rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Themes</option>
                {uniqueThemes.map((theme) => (
                  <option key={theme} value={theme}>
                    {theme}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setBulkDialogOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <Wand2 className="h-4 w-4" />
              Bulk Generate
            </button>
            <button
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4" />
              Add Mapping
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Format
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Theme
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Weight
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredMappings.map((mapping) => (
                <tr key={mapping.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {mapping.model_id}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {mapping.difficulty_parameters?.difficulty_level || 'N/A'}
                    {mapping.difficulty_parameters?.year_level && (
                      <span className="ml-1 text-xs text-gray-500">
                        (Year {mapping.difficulty_parameters.year_level})
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {mapping.format}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {mapping.theme}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {mapping.weight.toFixed(1)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <button
                      onClick={() => handleToggleActive(mapping)}
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        mapping.active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {mapping.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(mapping)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(mapping)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-sm text-gray-600">
          Showing {filteredMappings.length} of {mappings.length} mappings
        </div>
      </div>

      <MappingDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        mapping={selectedMapping}
      />

      <BulkMappingDialog
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
      />

      <DeleteConfirm
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedMapping(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Mapping"
        message="Are you sure you want to delete this mapping? This action cannot be undone."
        isDeleting={isDeleting}
      />
    </>
  );
}
