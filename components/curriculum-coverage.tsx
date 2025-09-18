'use client';

import { useState } from 'react';
import { GeneratedQuestion } from '@/lib/types';

interface GenerationCombination {
  strand: string;
  substrand: string;
  year: number;
  subLevel: number;
  suggestedModels: string[];
  primaryModel: string;
  questionsGenerated: number;
  status: 'pending' | 'generating' | 'completed' | 'error';
  questions?: GeneratedQuestion[];
  error?: string;
}

interface BulkGenerationConfig {
  selectedStrands: string[];
  selectedSubstrands: string[];
  selectedYears: number[];
  selectedSubLevels: number[];
  questionsPerCombination: number;
  useEnhancedDifficulty: boolean;
}

interface CurriculumCoverageProps {
  combinations: GenerationCombination[];
  config: BulkGenerationConfig;
}

type ViewMode = 'grid' | 'table' | 'hierarchy';
type FilterMode = 'all' | 'completed' | 'error' | 'pending';

export function CurriculumCoverage({ combinations, config }: CurriculumCoverageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedStrand, setSelectedStrand] = useState<string>('');
  const [expandedCombination, setExpandedCombination] = useState<string | null>(null);
  const [showQuestions, setShowQuestions] = useState<{ [key: string]: boolean }>({});

  // Filter combinations based on current filter mode
  const filteredCombinations = combinations.filter(combo => {
    if (filterMode === 'all') return true;
    return combo.status === filterMode;
  }).filter(combo => {
    if (!selectedStrand) return true;
    return combo.strand === selectedStrand;
  });

  // Group combinations by strand for hierarchy view
  const groupedByStrand = filteredCombinations.reduce((acc, combo) => {
    if (!acc[combo.strand]) {
      acc[combo.strand] = {};
    }
    if (!acc[combo.strand][combo.substrand]) {
      acc[combo.strand][combo.substrand] = [];
    }
    acc[combo.strand][combo.substrand].push(combo);
    return acc;
  }, {} as { [strand: string]: { [substrand: string]: GenerationCombination[] } });

  // Get unique strands for filtering
  const uniqueStrands = [...new Set(combinations.map(c => c.strand))].sort();

  // Statistics
  const stats = {
    total: combinations.length,
    completed: combinations.filter(c => c.status === 'completed').length,
    error: combinations.filter(c => c.status === 'error').length,
    pending: combinations.filter(c => c.status === 'pending').length,
    totalQuestions: combinations.reduce((sum, c) => sum + c.questionsGenerated, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'generating': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'error': return '❌';
      case 'generating': return '⏳';
      default: return '⏸️';
    }
  };

  const toggleQuestions = (comboKey: string) => {
    setShowQuestions(prev => ({
      ...prev,
      [comboKey]: !prev[comboKey]
    }));
  };

  const getCombinationKey = (combo: GenerationCombination) => {
    return `${combo.strand}-${combo.substrand}-${combo.year}-${combo.subLevel}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header with controls */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Curriculum Coverage</h3>

          {/* View mode selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('hierarchy')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'hierarchy'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Hierarchy
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.error}</div>
            <div className="text-sm text-gray-600">Errors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalQuestions}</div>
            <div className="text-sm text-gray-600">Questions</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Status filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as FilterMode)}
              className="px-3 py-1 border rounded-md text-sm bg-white"
            >
              <option value="all">All ({stats.total})</option>
              <option value="completed">Completed ({stats.completed})</option>
              <option value="error">Errors ({stats.error})</option>
              <option value="pending">Pending ({stats.pending})</option>
            </select>
          </div>

          {/* Strand filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Strand</label>
            <select
              value={selectedStrand}
              onChange={(e) => setSelectedStrand(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm bg-white"
            >
              <option value="">All Strands</option>
              {uniqueStrands.map(strand => (
                <option key={strand} value={strand}>{strand}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      <div className="p-6">
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Strand
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Substrand
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Questions
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCombinations.map((combo) => {
                  const comboKey = getCombinationKey(combo);
                  return (
                    <tr key={comboKey} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(combo.status)}`}>
                          {getStatusIcon(combo.status)} {combo.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate" title={combo.strand}>
                          {combo.strand}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={combo.substrand}>
                          {combo.substrand}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Year {combo.year}.{combo.subLevel}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{combo.primaryModel}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{combo.questionsGenerated}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {combo.questions && combo.questions.length > 0 && (
                          <button
                            onClick={() => toggleQuestions(comboKey)}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                          >
                            {showQuestions[comboKey] ? 'Hide' : 'Show'} Questions
                          </button>
                        )}
                        {combo.error && (
                          <div className="text-xs text-red-600 mt-1" title={combo.error}>
                            Error: {combo.error.substring(0, 50)}...
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCombinations.map((combo) => {
              const comboKey = getCombinationKey(combo);
              return (
                <div key={comboKey} className={`border rounded-lg p-4 ${getStatusColor(combo.status).replace('text-', 'border-').replace('bg-', 'bg-opacity-20 bg-')}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(combo.status)}`}>
                      {getStatusIcon(combo.status)} {combo.status}
                    </span>
                    <span className="text-sm font-medium text-gray-600">
                      Year {combo.year}.{combo.subLevel}
                    </span>
                  </div>

                  <h4 className="font-medium text-gray-900 mb-1 truncate" title={combo.strand}>
                    {combo.strand}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2 truncate" title={combo.substrand}>
                    {combo.substrand}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{combo.primaryModel}</span>
                    <span>{combo.questionsGenerated} questions</span>
                  </div>

                  {combo.questions && combo.questions.length > 0 && (
                    <button
                      onClick={() => toggleQuestions(comboKey)}
                      className="w-full mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      {showQuestions[comboKey] ? 'Hide' : 'Show'} Questions
                    </button>
                  )}

                  {combo.error && (
                    <div className="mt-2 text-xs text-red-600 p-2 bg-red-50 rounded" title={combo.error}>
                      Error: {combo.error.substring(0, 100)}...
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {viewMode === 'hierarchy' && (
          <div className="space-y-6">
            {Object.entries(groupedByStrand).map(([strand, substrands]) => (
              <div key={strand} className="border rounded-lg">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h4 className="font-medium text-gray-900">{strand}</h4>
                  <p className="text-sm text-gray-600">
                    {Object.values(substrands).flat().length} combinations
                  </p>
                </div>

                <div className="p-4 space-y-4">
                  {Object.entries(substrands).map(([substrand, combos]) => (
                    <div key={substrand} className="border-l-4 border-gray-200 pl-4">
                      <h5 className="font-medium text-gray-800 mb-2">{substrand}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {combos.map((combo) => {
                          const comboKey = getCombinationKey(combo);
                          return (
                            <div key={comboKey} className="bg-gray-50 rounded p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">Year {combo.year}.{combo.subLevel}</span>
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(combo.status)}`}>
                                  {getStatusIcon(combo.status)}
                                </span>
                              </div>
                              <div className="text-xs text-gray-600 mb-1">{combo.primaryModel}</div>
                              <div className="text-xs text-gray-500">{combo.questionsGenerated} questions</div>

                              {combo.questions && combo.questions.length > 0 && (
                                <button
                                  onClick={() => toggleQuestions(comboKey)}
                                  className="w-full mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                                >
                                  {showQuestions[comboKey] ? 'Hide' : 'Show'}
                                </button>
                              )}

                              {combo.error && (
                                <div className="mt-1 text-xs text-red-600" title={combo.error}>
                                  Error occurred
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Question details modal/expansion */}
        {Object.entries(showQuestions).map(([comboKey, isShown]) => {
          if (!isShown) return null;

          const combo = combinations.find(c => getCombinationKey(c) === comboKey);
          if (!combo || !combo.questions) return null;

          return (
            <div key={comboKey} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Generated Questions</h3>
                      <p className="text-sm text-gray-600">
                        {combo.strand} → {combo.substrand} (Year {combo.year}.{combo.subLevel})
                      </p>
                    </div>
                    <button
                      onClick={() => toggleQuestions(comboKey)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  <div className="space-y-4">
                    {combo.questions.map((question, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                            Question {index + 1}
                          </span>
                          <span className="text-xs text-gray-500">
                            {combo.primaryModel}
                          </span>
                        </div>

                        <div className="mb-3">
                          <p className="text-gray-900 font-medium">{question.question}</p>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <p className="text-green-800 font-semibold">
                            Answer: {question.answer}
                          </p>
                        </div>

                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                            Technical Details
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto">
                            {JSON.stringify(question.math_output, null, 2)}
                          </pre>
                        </details>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredCombinations.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No combinations match the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}