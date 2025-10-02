'use client';

import { useState } from 'react';
import { Wand2, Download, Save, RotateCcw } from 'lucide-react';
import { generateQuestions, GeneratedQuestionResult } from '@/lib/actions/generate';
import { QuestionPreview } from './QuestionPreview';
import { GeneratedQuestion } from '@/lib/actions/questions';
import { LoadingSpinner } from './LoadingSpinner';

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

export function GenerateQuestionsForm() {
  const [formData, setFormData] = useState({
    model_id: 'ADDITION',
    difficulty_level: '',
    format_preference: '',
    scenario_theme: '',
    count: 1,
    saveToDatabase: true,
    autoApprove: false,
  });
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestionResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const results = await generateQuestions(formData);
      setGeneratedQuestions(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate questions');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(generatedQuestions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `questions-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setGeneratedQuestions([]);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">Generation Settings</h2>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="model_id" className="block text-sm font-medium text-gray-700">
              Model <span className="text-red-600">*</span>
            </label>
            <select
              id="model_id"
              value={formData.model_id}
              onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
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

          <div>
            <label htmlFor="difficulty_level" className="block text-sm font-medium text-gray-700">
              Difficulty Level
            </label>
            <input
              type="text"
              id="difficulty_level"
              value={formData.difficulty_level}
              onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., 3.2 (leave blank for random)"
              disabled={isGenerating}
            />
          </div>

          <div>
            <label htmlFor="format_preference" className="block text-sm font-medium text-gray-700">
              Format Preference
            </label>
            <select
              id="format_preference"
              value={formData.format_preference}
              onChange={(e) => setFormData({ ...formData, format_preference: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isGenerating}
            >
              <option value="">Random</option>
              {FORMATS.map((format) => (
                <option key={format} value={format}>
                  {format.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="scenario_theme" className="block text-sm font-medium text-gray-700">
              Scenario Theme
            </label>
            <select
              id="scenario_theme"
              value={formData.scenario_theme}
              onChange={(e) => setFormData({ ...formData, scenario_theme: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isGenerating}
            >
              <option value="">Random</option>
              {THEMES.map((theme) => (
                <option key={theme} value={theme}>
                  {theme.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="count" className="block text-sm font-medium text-gray-700">
              Number of Questions
            </label>
            <input
              type="number"
              id="count"
              min="1"
              max="20"
              value={formData.count}
              onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) || 1 })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isGenerating}
            />
          </div>

          <div className="flex flex-col justify-end space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="saveToDatabase"
                checked={formData.saveToDatabase}
                onChange={(e) => setFormData({ ...formData, saveToDatabase: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isGenerating}
              />
              <label htmlFor="saveToDatabase" className="ml-2 block text-sm text-gray-700">
                Save to database
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoApprove"
                checked={formData.autoApprove}
                onChange={(e) => setFormData({ ...formData, autoApprove: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isGenerating || !formData.saveToDatabase}
              />
              <label htmlFor="autoApprove" className="ml-2 block text-sm text-gray-700">
                Auto-approve
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Wand2 className="h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Generate Questions'}
          </button>
          {generatedQuestions.length > 0 && (
            <>
              <button
                onClick={handleExportJSON}
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <Download className="h-4 w-4" />
                Export JSON
              </button>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </>
          )}
        </div>
      </div>

      {isGenerating && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-12 shadow">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-gray-600">
            Generating {formData.count} question{formData.count !== 1 ? 's' : ''}...
          </p>
        </div>
      )}

      {!isGenerating && generatedQuestions.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Generated Questions ({generatedQuestions.length})
            </h2>
            {formData.saveToDatabase && (
              <p className="text-sm text-gray-600">
                Saved to database
              </p>
            )}
          </div>

          <div className="space-y-4">
            {generatedQuestions.map((result, idx) => (
              <div key={idx} className="rounded-lg border border-gray-200 bg-white p-6 shadow">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Question {idx + 1}
                  </h3>
                  {result.questionId && (
                    <span className="text-xs text-gray-500">
                      ID: {result.questionId.slice(0, 8)}...
                    </span>
                  )}
                </div>
                <QuestionPreview
                  question={{
                    id: result.questionId || '',
                    model_id: result.question.model_id,
                    difficulty_level: result.question.difficulty_level,
                    format: result.question.format,
                    theme: result.question.theme,
                    question_text: result.question.question_text,
                    correct_answer: result.question.correct_answer,
                    distractors: result.question.distractors,
                    reasoning: result.question.reasoning,
                    metadata: result.metadata,
                    approved: result.question.approved || false,
                    created_at: new Date().toISOString(),
                  } as GeneratedQuestion}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
