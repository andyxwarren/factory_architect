'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Settings, ChevronsDown, ChevronsUp } from 'lucide-react';
import { DifficultyParameter, deleteDifficultyParam } from '@/lib/actions/difficulty-params';
import { DifficultyParamDialog } from './DifficultyParamDialog';
import { DeleteConfirm } from './DeleteConfirm';
import { EmptyState } from './EmptyState';

interface DifficultyParamTableProps {
  params: DifficultyParameter[];
}

export function DifficultyParamTable({ params }: DifficultyParamTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedParam, setSelectedParam] = useState<DifficultyParameter | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterModel, setFilterModel] = useState<string>('');
  const [filterYear, setFilterYear] = useState<number | ''>('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleEdit = (param: DifficultyParameter) => {
    setSelectedParam(param);
    setDialogOpen(true);
  };

  const handleDelete = (param: DifficultyParameter) => {
    setSelectedParam(param);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedParam) return;

    setIsDeleting(true);
    try {
      await deleteDifficultyParam(selectedParam.id);
      setDeleteDialogOpen(false);
      setSelectedParam(null);
    } catch (error) {
      console.error('Failed to delete parameter:', error);
      alert('Failed to delete parameter. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedParam(null);
  };

  const uniqueModels = Array.from(new Set(params.map((p) => p.model_id))).sort();
  const uniqueYears = Array.from(new Set(params.map((p) => p.year_level))).sort();

  const filteredParams = params.filter((param) => {
    if (filterModel && param.model_id !== filterModel) return false;
    if (filterYear && param.year_level !== filterYear) return false;
    return true;
  });

  const allExpanded = expandedRows.size === filteredParams.length && filteredParams.length > 0;

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedRows(new Set());
    } else {
      setExpandedRows(new Set(filteredParams.map((p) => p.id)));
    }
  };

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  if (params.length === 0) {
    return (
      <EmptyState
        icon={Settings}
        title="No difficulty parameters yet"
        description="Get started by creating your first difficulty parameter"
        action={{
          label: 'Add Parameter',
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
              <label htmlFor="filter-year" className="block text-sm font-medium text-gray-700">
                Year Level
              </label>
              <select
                id="filter-year"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value ? parseInt(e.target.value) : '')}
                className="mt-1 block rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Years</option>
                {uniqueYears.map((year) => (
                  <option key={year} value={year}>
                    Year {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleAll}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              {allExpanded ? (
                <>
                  <ChevronsUp className="h-4 w-4" />
                  Collapse All
                </>
              ) : (
                <>
                  <ChevronsDown className="h-4 w-4" />
                  Expand All
                </>
              )}
            </button>
            <button
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4" />
              Add Parameter
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <colgroup>
              <col className="w-[200px]" />
              <col className="w-[180px]" />
              <col className="w-[120px]" />
              <col className="w-auto" />
              <col className="w-[120px]" />
            </colgroup>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Model ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Difficulty Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Year Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Parameters
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredParams.map((param) => (
                <tr key={param.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {param.model_id}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {param.difficulty_level}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    Year {param.year_level}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>
                      <button
                        onClick={() => toggleRow(param.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {expandedRows.has(param.id) ? 'Hide JSON' : 'View JSON'}
                      </button>
                      {expandedRows.has(param.id) && (
                        <div className="mt-2 max-h-40 overflow-auto rounded bg-gray-100 p-2">
                          <pre className="text-xs">
                            {JSON.stringify(param.parameters, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(param)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(param)}
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
          Showing {filteredParams.length} of {params.length} parameters
        </div>
      </div>

      <DifficultyParamDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        param={selectedParam}
      />

      <DeleteConfirm
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedParam(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Difficulty Parameter"
        message={`Are you sure you want to delete this parameter for ${selectedParam?.model_id}? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </>
  );
}
