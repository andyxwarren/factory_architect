'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, FileText, Eye } from 'lucide-react';
import { ScenarioTemplate, deleteTemplate, toggleTemplateActive } from '@/lib/actions/templates';
import { TemplateDialog } from './TemplateDialog';
import { TemplatePreviewDialog } from './TemplatePreviewDialog';
import { DeleteConfirm } from './DeleteConfirm';
import { EmptyState } from './EmptyState';

interface TemplateTableProps {
  templates: ScenarioTemplate[];
}

export function TemplateTable({ templates }: TemplateTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ScenarioTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterTheme, setFilterTheme] = useState<string>('');
  const [filterFormat, setFilterFormat] = useState<string>('');

  const handleEdit = (template: ScenarioTemplate) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
  };

  const handlePreview = (template: ScenarioTemplate) => {
    setSelectedTemplate(template);
    setPreviewDialogOpen(true);
  };

  const handleDelete = (template: ScenarioTemplate) => {
    setSelectedTemplate(template);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedTemplate) return;

    setIsDeleting(true);
    try {
      await deleteTemplate(selectedTemplate.id);
      setDeleteDialogOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Failed to delete template:', error);
      alert('Failed to delete template. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (template: ScenarioTemplate) => {
    try {
      await toggleTemplateActive(template.id, !template.active);
    } catch (error) {
      console.error('Failed to toggle template:', error);
      alert('Failed to update template status. Please try again.');
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTemplate(null);
  };

  const uniqueThemes = Array.from(new Set(templates.map((t) => t.theme))).sort();
  const uniqueFormats = Array.from(new Set(templates.map((t) => t.format))).sort();

  const filteredTemplates = templates.filter((template) => {
    if (filterTheme && template.theme !== filterTheme) return false;
    if (filterFormat && template.format !== filterFormat) return false;
    return true;
  });

  if (templates.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No templates yet"
        description="Get started by creating your first scenario template"
        action={{
          label: 'Add Template',
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
          </div>

          <button
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4" />
            Add Template
          </button>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Theme
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Format
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Template Text
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Placeholders
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
              {filteredTemplates.map((template) => (
                <tr key={template.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {template.theme}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {template.format}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="max-w-md truncate">
                      {template.template_text}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex flex-wrap gap-1">
                      {(template.placeholders || []).slice(0, 3).map((placeholder, idx) => (
                        <span
                          key={idx}
                          className="inline-flex rounded bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-700"
                        >
                          {placeholder}
                        </span>
                      ))}
                      {(template.placeholders || []).length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{(template.placeholders || []).length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <button
                      onClick={() => handleToggleActive(template)}
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        template.active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {template.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handlePreview(template)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(template)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(template)}
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
          Showing {filteredTemplates.length} of {templates.length} templates
        </div>
      </div>

      <TemplateDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        template={selectedTemplate}
      />

      <TemplatePreviewDialog
        open={previewDialogOpen}
        onClose={() => {
          setPreviewDialogOpen(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
      />

      <DeleteConfirm
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedTemplate(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Template"
        message={`Are you sure you want to delete this ${selectedTemplate?.theme} template? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </>
  );
}
