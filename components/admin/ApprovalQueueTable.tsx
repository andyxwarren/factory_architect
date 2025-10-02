'use client';

import { useState } from 'react';
import { CheckSquare, XSquare, Eye, CheckCircle, XCircle } from 'lucide-react';
import { GeneratedQuestion, approveQuestion, rejectQuestion, batchApproveQuestions, batchRejectQuestions } from '@/lib/actions/questions';
import { QuestionPreview } from './QuestionPreview';
import { Dialog } from './Dialog';
import { DeleteConfirm } from './DeleteConfirm';
import { EmptyState } from './EmptyState';

interface ApprovalQueueTableProps {
  questions: GeneratedQuestion[];
}

export function ApprovalQueueTable({ questions }: ApprovalQueueTableProps) {
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [previewQuestion, setPreviewQuestion] = useState<GeneratedQuestion | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [questionToReject, setQuestionToReject] = useState<GeneratedQuestion | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterModel, setFilterModel] = useState<string>('');
  const [filterFormat, setFilterFormat] = useState<string>('');
  const [filterTheme, setFilterTheme] = useState<string>('');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedQuestions(new Set(filteredQuestions.map((q) => q.id)));
    } else {
      setSelectedQuestions(new Set());
    }
  };

  const handleSelectQuestion = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedQuestions);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedQuestions(newSelected);
  };

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    try {
      await approveQuestion(id);
      setSelectedQuestions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      console.error('Failed to approve question:', error);
      alert('Failed to approve question. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (question: GeneratedQuestion) => {
    setQuestionToReject(question);
    setRejectDialogOpen(true);
  };

  const confirmReject = async () => {
    if (!questionToReject) return;

    setIsProcessing(true);
    try {
      await rejectQuestion(questionToReject.id);
      setSelectedQuestions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(questionToReject.id);
        return newSet;
      });
      setRejectDialogOpen(false);
      setQuestionToReject(null);
    } catch (error) {
      console.error('Failed to reject question:', error);
      alert('Failed to reject question. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchApprove = async () => {
    if (selectedQuestions.size === 0) return;

    setIsProcessing(true);
    try {
      await batchApproveQuestions(Array.from(selectedQuestions));
      setSelectedQuestions(new Set());
    } catch (error) {
      console.error('Failed to batch approve questions:', error);
      alert('Failed to batch approve questions. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchReject = async () => {
    if (selectedQuestions.size === 0) return;

    if (!confirm(`Are you sure you want to reject ${selectedQuestions.size} questions? This action cannot be undone.`)) {
      return;
    }

    setIsProcessing(true);
    try {
      await batchRejectQuestions(Array.from(selectedQuestions));
      setSelectedQuestions(new Set());
    } catch (error) {
      console.error('Failed to batch reject questions:', error);
      alert('Failed to batch reject questions. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const uniqueModels = Array.from(new Set(questions.map((q) => q.model_id))).sort();
  const uniqueFormats = Array.from(new Set(questions.map((q) => q.format))).sort();
  const uniqueThemes = Array.from(new Set(questions.map((q) => q.theme))).sort();

  const filteredQuestions = questions.filter((question) => {
    if (filterModel && question.model_id !== filterModel) return false;
    if (filterFormat && question.format !== filterFormat) return false;
    if (filterTheme && question.theme !== filterTheme) return false;
    return true;
  });

  if (questions.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="No questions pending approval"
        description="All generated questions have been reviewed"
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

          {selectedQuestions.size > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleBatchApprove}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                Approve {selectedQuestions.size}
              </button>
              <button
                onClick={handleBatchReject}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Reject {selectedQuestions.size}
              </button>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.size === filteredQuestions.length && filteredQuestions.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Format
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredQuestions.map((question) => (
                <tr key={question.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.has(question.id)}
                      onChange={(e) => handleSelectQuestion(question.id, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-md truncate">{question.question_text}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {question.model_id}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {question.difficulty_level}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {question.format}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setPreviewQuestion(question)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleApprove(question.id)}
                        disabled={isProcessing}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        title="Approve"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleReject(question)}
                        disabled={isProcessing}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        title="Reject"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-sm text-gray-600">
          Showing {filteredQuestions.length} of {questions.length} questions
        </div>
      </div>

      <Dialog
        open={!!previewQuestion}
        onClose={() => setPreviewQuestion(null)}
        title="Question Preview"
        maxWidth="lg"
      >
        {previewQuestion && <QuestionPreview question={previewQuestion} />}
      </Dialog>

      <DeleteConfirm
        open={rejectDialogOpen}
        onClose={() => {
          setRejectDialogOpen(false);
          setQuestionToReject(null);
        }}
        onConfirm={confirmReject}
        title="Reject Question"
        message="Are you sure you want to reject this question? This action cannot be undone."
        isDeleting={isProcessing}
      />
    </>
  );
}
