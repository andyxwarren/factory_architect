'use client';

import { useState, useEffect } from 'react';
import { GeneratedQuestion } from '@/lib/types';
import { MODEL_STATUS_REGISTRY, ModelStatus, getCompletionStats } from '@/lib/models/model-status';
import { curriculumParser, CurriculumFilter } from '@/lib/curriculum/curriculum-parser';
import { curriculumModelMapper } from '@/lib/curriculum/curriculum-model-mapping';

type FilterMode = 'model' | 'curriculum';

const YEARS = [1, 2, 3, 4, 5, 6];

export default function TestPage() {
  // Filter mode state
  const [filterMode, setFilterMode] = useState<FilterMode>('model');
  
  // Model-first filtering
  const [selectedModel, setSelectedModel] = useState('ADDITION');
  const [selectedYear, setSelectedYear] = useState(4);
  
  // Curriculum-first filtering
  const [selectedStrand, setSelectedStrand] = useState('');
  const [selectedSubstrand, setSelectedSubstrand] = useState('');
  const [selectedCurriculumYear, setSelectedCurriculumYear] = useState(1);
  const [curriculumFilter, setCurriculumFilter] = useState<CurriculumFilter | null>(null);
  const [suggestedModels, setSuggestedModels] = useState<string[]>([]);
  
  // Curriculum data
  const [strands, setStrands] = useState<string[]>([]);
  const [substrands, setSubstrands] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  
  // Question state
  const [generatedQuestion, setGeneratedQuestion] = useState<GeneratedQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [questionHistory, setQuestionHistory] = useState<GeneratedQuestion[]>([]);

  // Initialize curriculum data
  useEffect(() => {
    const allStrands = curriculumParser.getStrands();
    setStrands(allStrands);
    if (allStrands.length > 0 && !selectedStrand) {
      setSelectedStrand(allStrands[0]);
    }
  }, []);

  // Update substrands when strand changes
  useEffect(() => {
    if (selectedStrand) {
      const strandSubstrands = curriculumParser.getSubstrands(selectedStrand);
      setSubstrands(strandSubstrands);
      if (strandSubstrands.length > 0) {
        setSelectedSubstrand(strandSubstrands[0]);
      }
    }
  }, [selectedStrand]);

  // Update available years when substrand changes
  useEffect(() => {
    if (selectedStrand && selectedSubstrand) {
      const years = curriculumParser.getAvailableYears(selectedStrand, selectedSubstrand);
      setAvailableYears(years);
      if (years.length > 0) {
        setSelectedCurriculumYear(years[0]);
      }
    }
  }, [selectedStrand, selectedSubstrand]);

  // Update curriculum filter and suggested models
  useEffect(() => {
    if (selectedStrand && selectedSubstrand && selectedCurriculumYear) {
      const filter = curriculumParser.getCurriculumDescription(
        selectedStrand,
        selectedSubstrand,
        selectedCurriculumYear
      );
      setCurriculumFilter(filter);
      
      if (filter) {
        const suggested = curriculumModelMapper.getSuggestedModels(filter);
        setSuggestedModels(suggested);
      }
    }
  }, [selectedStrand, selectedSubstrand, selectedCurriculumYear]);

  const generateQuestion = async (modelId?: string, yearLevel?: number) => {
    const model = modelId || (filterMode === 'model' ? selectedModel : suggestedModels[0]);
    const year = yearLevel || (filterMode === 'model' ? selectedYear : selectedCurriculumYear);
    
    if (!model) {
      setError('No model selected or available');
      return;
    }

    setLoading(true);
    setError(null);
    setShowAnswer(false);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_id: model,
          year_level: year,
          context_type: 'money'
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate question: ${response.statusText}`);
      }

      const data: GeneratedQuestion = await response.json();
      setGeneratedQuestion(data);
      setQuestionHistory(prev => [data, ...prev.slice(0, 9)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getModelStatusBadge = (modelId: string) => {
    const modelInfo = MODEL_STATUS_REGISTRY[modelId];
    if (!modelInfo) return null;

    const statusColors = {
      [ModelStatus.COMPLETE]: 'bg-green-100 text-green-800 border-green-200',
      [ModelStatus.WIP]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      [ModelStatus.BROKEN]: 'bg-red-100 text-red-800 border-red-200',
      [ModelStatus.PLANNED]: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const statusLabels = {
      [ModelStatus.COMPLETE]: '✓',
      [ModelStatus.WIP]: 'WIP',
      [ModelStatus.BROKEN]: '⚠',
      [ModelStatus.PLANNED]: '○'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColors[modelInfo.status]}`}>
        {statusLabels[modelInfo.status]}
      </span>
    );
  };

  const getModelDisplayName = (modelId: string) => {
    const modelInfo = MODEL_STATUS_REGISTRY[modelId];
    return modelInfo ? modelInfo.name : modelId.replace('_', ' ');
  };

  const isModelDisabled = (modelId: string) => {
    const modelInfo = MODEL_STATUS_REGISTRY[modelId];
    return modelInfo?.status === ModelStatus.BROKEN;
  };

  const completionStats = getCompletionStats();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mathematics Question Generator</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Total Models: {completionStats.total}</span>
            <span className="text-green-600">Complete: {completionStats.complete}</span>
            <span className="text-yellow-600">WIP: {completionStats.wip}</span>
            <span className="text-red-600">Broken: {completionStats.broken}</span>
            <span className="font-medium">{completionStats.completionPercentage}% Ready</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Question Generator</h2>
              
              {/* Filter Mode Toggle */}
              <div className="mb-6">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setFilterMode('model')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      filterMode === 'model' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Browse by Model
                  </button>
                  <button
                    onClick={() => setFilterMode('curriculum')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      filterMode === 'curriculum' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Browse by Curriculum
                  </button>
                </div>
              </div>

              {/* Model-First Filtering */}
              {filterMode === 'model' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mathematical Model
                    </label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full p-2 border rounded-md bg-white"
                      disabled={loading}
                    >
                      {Object.keys(MODEL_STATUS_REGISTRY).map(modelId => (
                        <option key={modelId} value={modelId} disabled={isModelDisabled(modelId)}>
                          {getModelDisplayName(modelId)} {isModelDisabled(modelId) ? '(Broken)' : ''}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2 flex items-center gap-2">
                      {getModelStatusBadge(selectedModel)}
                      {MODEL_STATUS_REGISTRY[selectedModel]?.knownIssues && (
                        <span className="text-xs text-gray-500">
                          Known issues: {MODEL_STATUS_REGISTRY[selectedModel]?.knownIssues?.length}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year Level
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="w-full p-2 border rounded-md bg-white"
                      disabled={loading}
                    >
                      {YEARS.filter(year => 
                        MODEL_STATUS_REGISTRY[selectedModel]?.supportedYears.includes(year)
                      ).map(year => (
                        <option key={year} value={year}>Year {year}</option>
                      ))}
                    </select>
                  </div>

                  {MODEL_STATUS_REGISTRY[selectedModel] && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
                      <p className="font-medium">{MODEL_STATUS_REGISTRY[selectedModel].name}</p>
                      <p className="text-gray-600 mt-1">{MODEL_STATUS_REGISTRY[selectedModel].description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Curriculum areas: {MODEL_STATUS_REGISTRY[selectedModel].curriculumAreas.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Curriculum-First Filtering */}
              {filterMode === 'curriculum' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Curriculum Strand
                    </label>
                    <select
                      value={selectedStrand}
                      onChange={(e) => setSelectedStrand(e.target.value)}
                      className="w-full p-2 border rounded-md bg-white"
                      disabled={loading}
                    >
                      {strands.map(strand => (
                        <option key={strand} value={strand}>{strand}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Substrand
                    </label>
                    <select
                      value={selectedSubstrand}
                      onChange={(e) => setSelectedSubstrand(e.target.value)}
                      className="w-full p-2 border rounded-md bg-white"
                      disabled={loading}
                    >
                      {substrands.map(substrand => (
                        <option key={substrand} value={substrand}>{substrand}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year Level
                    </label>
                    <select
                      value={selectedCurriculumYear}
                      onChange={(e) => setSelectedCurriculumYear(parseInt(e.target.value))}
                      className="w-full p-2 border rounded-md bg-white"
                      disabled={loading}
                    >
                      {availableYears.map(year => (
                        <option key={year} value={year}>Year {year}</option>
                      ))}
                    </select>
                  </div>

                  {curriculumFilter && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm">
                      <p className="font-medium text-blue-900">UK Curriculum Requirement</p>
                      <p className="text-blue-800 mt-1">{curriculumFilter.description}</p>
                      <p className="text-xs text-blue-600 mt-2">
                        Reference: {curriculumFilter.contentDomainRef}
                      </p>
                    </div>
                  )}

                  {suggestedModels.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Suggested Models</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestedModels.map(modelId => (
                          <button
                            key={modelId}
                            onClick={() => generateQuestion(modelId, selectedCurriculumYear)}
                            disabled={loading || isModelDisabled(modelId)}
                            className={`px-2 py-1 text-xs rounded-md border flex items-center gap-1 ${
                              isModelDisabled(modelId)
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {getModelDisplayName(modelId)}
                            {getModelStatusBadge(modelId)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={() => generateQuestion()}
                disabled={loading || (filterMode === 'curriculum' && suggestedModels.length === 0) || (filterMode === 'model' && isModelDisabled(selectedModel))}
                className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Generate Question'}
              </button>
            </div>
          </div>

          {/* Question Display */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Generated Question</h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                  {error}
                </div>
              )}

              {generatedQuestion && (
                <div>
                  <div className="mb-4 p-4 bg-gray-50 rounded-md">
                    <p className="text-lg font-medium">{generatedQuestion.question}</p>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setShowAnswer(!showAnswer)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      {showAnswer ? 'Hide Answer' : 'Show Answer'}
                    </button>
                    
                    <div className="text-sm text-gray-500">
                      Model: {generatedQuestion.metadata.model_id} | Year: {generatedQuestion.metadata.year_level}
                    </div>
                  </div>

                  {showAnswer && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-lg font-semibold text-green-800">
                        Answer: {generatedQuestion.answer}
                      </p>
                    </div>
                  )}

                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                      Technical Details
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 p-3 rounded-md overflow-auto">
                      {JSON.stringify(generatedQuestion, null, 2)}
                    </pre>
                  </details>
                </div>
              )}

              {!generatedQuestion && !loading && !error && (
                <div className="text-center py-12 text-gray-500">
                  <p>Select your preferences above and click "Generate Question" to start.</p>
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Generating your question...</p>
                </div>
              )}
            </div>

            {/* Question History */}
            {questionHistory.length > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Questions</h3>
                <div className="space-y-3">
                  {questionHistory.slice(0, 5).map((q, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm">{q.question}</p>
                      <div className="mt-1 text-xs text-gray-500">
                        {q.metadata.model_id} | Year {q.metadata.year_level}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}