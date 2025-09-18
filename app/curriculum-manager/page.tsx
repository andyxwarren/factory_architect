'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GeneratedQuestion } from '@/lib/types';
import { curriculumParser, CurriculumFilter } from '@/lib/curriculum/curriculum-parser';
import { curriculumModelMapper } from '@/lib/curriculum/curriculum-model-mapping';
import { MODEL_STATUS_REGISTRY, ModelStatus } from '@/lib/models/model-status';
import { CurriculumCoverage } from '@/components/curriculum-coverage';

interface BulkGenerationConfig {
  selectedStrands: string[];
  selectedSubstrands: string[];
  selectedYears: number[];
  selectedSubLevels: number[];
  questionsPerCombination: number;
  useEnhancedDifficulty: boolean;
}

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

interface BulkGenerationResult {
  combinations: GenerationCombination[];
  totalQuestions: number;
  completedCombinations: number;
  totalCombinations: number;
  startTime: Date;
  endTime?: Date;
  errors: string[];
}

const YEARS = [1, 2, 3, 4, 5, 6];
const SUB_LEVELS = [1, 2, 3, 4];
const ENHANCED_MODELS = ['ADDITION', 'SUBTRACTION', 'MULTIPLICATION', 'DIVISION', 'PERCENTAGE', 'FRACTION'];

export default function CurriculumManagerPage() {
  // Curriculum data
  const [strands, setStrands] = useState<string[]>([]);
  const [substrandsByStrand, setSubstrandsByStrand] = useState<{ [strand: string]: string[] }>({});
  const [allSubstrands, setAllSubstrands] = useState<string[]>([]);

  // Generation configuration
  const [config, setConfig] = useState<BulkGenerationConfig>({
    selectedStrands: [],
    selectedSubstrands: [],
    selectedYears: YEARS,
    selectedSubLevels: [3], // Default to standard level
    questionsPerCombination: 1,
    useEnhancedDifficulty: true
  });

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<BulkGenerationResult | null>(null);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [totalEstimated, setTotalEstimated] = useState(0);
  const [estimatedCombinations, setEstimatedCombinations] = useState<GenerationCombination[]>([]);
  const [generationPhase, setGenerationPhase] = useState<'idle' | 'preparing' | 'generating' | 'processing' | 'completed'>('idle');

  // UI state
  const [showResults, setShowResults] = useState(false);
  const [selectedView, setSelectedView] = useState<'config' | 'progress' | 'results'>('config');

  // Initialize curriculum data
  useEffect(() => {
    const allStrands = curriculumParser.getStrands();
    setStrands(allStrands);

    const substrandMap: { [strand: string]: string[] } = {};
    const allSubs: string[] = [];

    allStrands.forEach(strand => {
      const substrands = curriculumParser.getSubstrands(strand);
      substrandMap[strand] = substrands;
      allSubs.push(...substrands);
    });

    setSubstrandsByStrand(substrandMap);
    setAllSubstrands([...new Set(allSubs)]);

    // Default to first strand
    if (allStrands.length > 0 && config.selectedStrands.length === 0) {
      setConfig(prev => ({
        ...prev,
        selectedStrands: [allStrands[0]],
        selectedSubstrands: substrandMap[allStrands[0]] || []
      }));
    }
  }, []);

  // Update substrands when strands change
  useEffect(() => {
    if (config.selectedStrands.length > 0) {
      const relevantSubstrands = config.selectedStrands.flatMap(strand =>
        substrandsByStrand[strand] || []
      );
      const uniqueSubstrands = [...new Set(relevantSubstrands)];

      if (JSON.stringify(config.selectedSubstrands) !== JSON.stringify(uniqueSubstrands)) {
        setConfig(prev => ({
          ...prev,
          selectedSubstrands: uniqueSubstrands
        }));
      }
    }
  }, [config.selectedStrands, substrandsByStrand]);

  // Calculate estimated combinations
  useEffect(() => {
    const combinations: GenerationCombination[] = [];

    config.selectedStrands.forEach(strand => {
      const strandSubstrands = substrandsByStrand[strand] || [];
      const relevantSubstrands = config.selectedSubstrands.filter(sub =>
        strandSubstrands.includes(sub)
      );

      relevantSubstrands.forEach(substrand => {
        const availableYears = curriculumParser.getAvailableYears(strand, substrand);
        const validYears = config.selectedYears.filter(year => availableYears.includes(year));

        validYears.forEach(year => {
          config.selectedSubLevels.forEach(subLevel => {
            const curriculumFilter = curriculumParser.getCurriculumDescription(strand, substrand, year);

            if (curriculumFilter) {
              const suggestedModels = curriculumModelMapper.getSuggestedModels(curriculumFilter);
              const primaryModel = curriculumModelMapper.getPrimaryModel(curriculumFilter);

              if (suggestedModels.length > 0 && primaryModel) {
                combinations.push({
                  strand,
                  substrand,
                  year,
                  subLevel,
                  suggestedModels,
                  primaryModel,
                  questionsGenerated: 0,
                  status: 'pending'
                });
              }
            }
          });
        });
      });
    });

    setEstimatedCombinations(combinations);
    setTotalEstimated(combinations.length * config.questionsPerCombination);
  }, [config, substrandsByStrand]);

  const handleStrandSelection = (strand: string, selected: boolean) => {
    setConfig(prev => ({
      ...prev,
      selectedStrands: selected
        ? [...prev.selectedStrands, strand]
        : prev.selectedStrands.filter(s => s !== strand)
    }));
  };

  const selectAllStrands = () => {
    setConfig(prev => ({
      ...prev,
      selectedStrands: [...strands]
    }));
  };

  const clearAllStrands = () => {
    setConfig(prev => ({
      ...prev,
      selectedStrands: []
    }));
  };

  const handleYearSelection = (year: number, selected: boolean) => {
    setConfig(prev => ({
      ...prev,
      selectedYears: selected
        ? [...prev.selectedYears, year]
        : prev.selectedYears.filter(y => y !== year)
    }));
  };

  const handleSubLevelSelection = (subLevel: number, selected: boolean) => {
    setConfig(prev => ({
      ...prev,
      selectedSubLevels: selected
        ? [...prev.selectedSubLevels, subLevel]
        : prev.selectedSubLevels.filter(sl => sl !== subLevel)
    }));
  };

  const startBulkGeneration = async () => {
    if (estimatedCombinations.length === 0) {
      alert('No valid combinations found. Please check your selection.');
      return;
    }

    // Check for large batch sizes and warn user
    const totalEstimatedQuestions = estimatedCombinations.length * config.questionsPerCombination;
    if (totalEstimatedQuestions > 1000) {
      const confirmed = confirm(
        `You are about to generate ${totalEstimatedQuestions} questions across ${estimatedCombinations.length} combinations. This may take several minutes. Continue?`
      );
      if (!confirmed) return;
    }

    setIsGenerating(true);
    setCurrentProgress(0);
    setSelectedView('progress');
    setShowResults(false);
    setGenerationPhase('preparing');

    // Initialize result structure
    const result: BulkGenerationResult = {
      combinations: [...estimatedCombinations.map(combo => ({ ...combo, status: 'pending' as const }))],
      totalQuestions: 0,
      completedCombinations: 0,
      totalCombinations: estimatedCombinations.length,
      startTime: new Date(),
      errors: []
    };

    setGenerationResult(result);

    try {
      // Show preparation phase
      await new Promise(resolve => setTimeout(resolve, 500));
      setGenerationPhase('generating');

      // Prepare request for bulk API
      const requestBody = {
        strands: config.selectedStrands,
        substrands: config.selectedSubstrands,
        years: config.selectedYears,
        subLevels: config.selectedSubLevels,
        questionsPerCombination: config.questionsPerCombination,
        useEnhancedDifficulty: config.useEnhancedDifficulty,
        contextType: 'money',
        sessionId: `curriculum_bulk_${Date.now()}`
      };

      console.log('Starting bulk generation with request:', requestBody);

      // Simulate progress for better UX (since bulk API doesn't provide real-time progress)
      const progressInterval = setInterval(() => {
        setCurrentProgress(prev => {
          const newProgress = Math.min(prev + 1, estimatedCombinations.length - 1);
          return newProgress;
        });
      }, Math.max(100, Math.min(1000, estimatedCombinations.length * 50))); // Adaptive timing

      const response = await fetch('/api/curriculum-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Clear progress interval and show processing phase
      clearInterval(progressInterval);
      setGenerationPhase('processing');
      setCurrentProgress(estimatedCombinations.length);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const bulkResult = await response.json();
      console.log('Bulk generation completed:', bulkResult);

      // Transform bulk API response to our internal format
      const transformedCombinations: GenerationCombination[] = bulkResult.results.map((apiResult: any) => ({
        strand: apiResult.strand,
        substrand: apiResult.substrand,
        year: apiResult.year,
        subLevel: apiResult.subLevel,
        suggestedModels: apiResult.suggestedModels,
        primaryModel: apiResult.primaryModel,
        questionsGenerated: apiResult.questionsGenerated,
        status: apiResult.status,
        questions: apiResult.questions,
        error: apiResult.error
      }));

      // Update result with bulk API response
      const finalResult: BulkGenerationResult = {
        combinations: transformedCombinations,
        totalQuestions: bulkResult.totalQuestions,
        completedCombinations: bulkResult.completedCombinations,
        totalCombinations: bulkResult.totalCombinations,
        startTime: new Date(bulkResult.metadata.timestamp),
        endTime: new Date(),
        errors: bulkResult.errors
      };

      setGenerationResult(finalResult);
      setCurrentProgress(bulkResult.completedCombinations);
      setGenerationPhase('completed');
      setShowResults(true);
      setSelectedView('results');

      // Show summary notification
      if (bulkResult.errors.length > 0) {
        alert(`Generation completed with ${bulkResult.errors.length} errors. Check the results tab for details.`);
      } else {
        alert(`Successfully generated ${bulkResult.totalQuestions} questions across ${bulkResult.completedCombinations} combinations!`);
      }

    } catch (error) {
      console.error('Bulk generation failed:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      // Update result with error information
      result.endTime = new Date();
      result.errors = [errorMessage];

      // Mark all combinations as error
      result.combinations = result.combinations.map(combo => ({
        ...combo,
        status: 'error' as const,
        error: errorMessage
      }));

      setGenerationResult(result);
      setGenerationPhase('completed');
      setShowResults(true);
      setSelectedView('results');

      alert(`Bulk generation failed: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToCSV = () => {
    if (!generationResult) return;

    const headers = [
      'Question ID',
      'Question Text',
      'Answer',
      'Strand',
      'Substrand',
      'Year Level',
      'Sub Level',
      'Full Level',
      'Model Used',
      'Suggested Models',
      'Enhanced System Used',
      'Context Type',
      'Generation Status',
      'Questions Generated',
      'Generation Time',
      'Curriculum Reference',
      'Error Message'
    ];

    const csvRows = [headers.join(',')];

    generationResult.combinations.forEach((combination, combIndex) => {
      if (combination.questions && combination.questions.length > 0) {
        // Export each individual question
        combination.questions.forEach((question, qIndex) => {
          const row = [
            `"C${combIndex + 1}_Q${qIndex + 1}"`,
            `"${question.question.replace(/"/g, '""')}"`,
            `"${question.answer}"`,
            `"${combination.strand}"`,
            `"${combination.substrand}"`,
            combination.year,
            combination.subLevel,
            `"${combination.year}.${combination.subLevel}"`,
            `"${combination.primaryModel}"`,
            `"${combination.suggestedModels.join('; ')}"`,
            question.metadata.enhanced_system_used ? 'Yes' : 'No',
            'Money',
            'Completed',
            combination.questionsGenerated,
            question.metadata.timestamp ? new Date(question.metadata.timestamp).toISOString() : '',
            `"Year ${combination.year} Curriculum"`,
            ''
          ];
          csvRows.push(row.join(','));
        });
      } else {
        // Export combination even if no questions were generated (for error tracking)
        const row = [
          `"C${combIndex + 1}_ERROR"`,
          'NO QUESTION GENERATED',
          'NO ANSWER',
          `"${combination.strand}"`,
          `"${combination.substrand}"`,
          combination.year,
          combination.subLevel,
          `"${combination.year}.${combination.subLevel}"`,
          `"${combination.primaryModel}"`,
          `"${combination.suggestedModels.join('; ')}"`,
          'N/A',
          'Money',
          combination.status,
          combination.questionsGenerated,
          '',
          `"Year ${combination.year} Curriculum"`,
          `"${combination.error || 'Unknown error'}"`
        ];
        csvRows.push(row.join(','));
      }
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `curriculum_questions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    if (!generationResult) return;

    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        generationStartTime: generationResult.startTime.toISOString(),
        generationEndTime: generationResult.endTime?.toISOString(),
        totalCombinations: generationResult.totalCombinations,
        completedCombinations: generationResult.completedCombinations,
        failedCombinations: generationResult.totalCombinations - generationResult.completedCombinations,
        totalQuestions: generationResult.totalQuestions,
        generationTimeMs: generationResult.endTime && generationResult.startTime
          ? generationResult.endTime.getTime() - generationResult.startTime.getTime()
          : null,
        averageQuestionsPerCombination: generationResult.completedCombinations > 0
          ? Math.round((generationResult.totalQuestions / generationResult.completedCombinations) * 100) / 100
          : 0,
        configuration: {
          ...config,
          estimatedCombinations: estimatedCombinations.length,
          actualCombinations: generationResult.totalCombinations
        },
        statistics: {
          successRate: Math.round((generationResult.completedCombinations / generationResult.totalCombinations) * 100),
          errorCount: generationResult.errors.length,
          strandsProcessed: [...new Set(generationResult.combinations.map(c => c.strand))],
          modelsUsed: [...new Set(generationResult.combinations.map(c => c.primaryModel))],
          yearLevelsProcessed: [...new Set(generationResult.combinations.map(c => c.year))].sort(),
          subLevelsProcessed: [...new Set(generationResult.combinations.map(c => c.subLevel))].sort()
        },
        errors: generationResult.errors
      },
      curriculumData: {
        byStrand: generationResult.combinations.reduce((acc, combination) => {
          if (!acc[combination.strand]) {
            acc[combination.strand] = {
              substrands: {},
              totalQuestions: 0,
              totalCombinations: 0,
              completedCombinations: 0
            };
          }

          if (!acc[combination.strand].substrands[combination.substrand]) {
            acc[combination.strand].substrands[combination.substrand] = {
              combinations: [],
              totalQuestions: 0,
              yearLevels: []
            };
          }

          const strandData = acc[combination.strand];
          const substrandData = strandData.substrands[combination.substrand];

          substrandData.combinations.push({
            year: combination.year,
            subLevel: combination.subLevel,
            fullLevel: `${combination.year}.${combination.subLevel}`,
            primaryModel: combination.primaryModel,
            status: combination.status,
            questionsGenerated: combination.questionsGenerated,
            error: combination.error
          });

          substrandData.totalQuestions += combination.questionsGenerated;
          substrandData.yearLevels = [...new Set([...substrandData.yearLevels, combination.year])].sort();

          strandData.totalQuestions += combination.questionsGenerated;
          strandData.totalCombinations++;
          if (combination.status === 'completed') {
            strandData.completedCombinations++;
          }

          return acc;
        }, {} as any)
      },
      questions: generationResult.combinations.map((combination, combIndex) => ({
        combinationId: `C${combIndex + 1}`,
        curriculum: {
          strand: combination.strand,
          substrand: combination.substrand,
          year: combination.year,
          subLevel: combination.subLevel,
          fullLevel: `${combination.year}.${combination.subLevel}`
        },
        model: {
          primaryModel: combination.primaryModel,
          suggestedModels: combination.suggestedModels,
          modelCategory: ENHANCED_MODELS.includes(combination.primaryModel) ? 'Enhanced' : 'Standard'
        },
        generation: {
          status: combination.status,
          questionsGenerated: combination.questionsGenerated,
          requestedQuestions: config.questionsPerCombination,
          error: combination.error
        },
        questions: (combination.questions || []).map((question, qIndex) => ({
          questionId: `C${combIndex + 1}_Q${qIndex + 1}`,
          questionText: question.question,
          answer: question.answer,
          mathOutput: question.math_output,
          context: question.context,
          metadata: {
            ...question.metadata,
            enhancedSystemUsed: question.metadata.enhanced_system_used,
            generationTimestamp: question.metadata.timestamp
          }
        }))
      }))
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `curriculum_questions_complete_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Curriculum Question Manager</h1>
            <div className="flex gap-2">
              <Link
                href="/"
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
              >
                Home
              </Link>
              <Link
                href="/test"
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
              >
                Question Testing
              </Link>
            </div>
          </div>
          <p className="text-gray-600">Generate questions for every combination of strand, substrand, year level, and sublevel</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setSelectedView('config')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedView === 'config'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Configuration
              </button>
              <button
                onClick={() => setSelectedView('progress')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedView === 'progress'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                disabled={!isGenerating && !showResults}
              >
                Generation Progress
              </button>
              <button
                onClick={() => setSelectedView('results')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedView === 'results'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                disabled={!showResults}
              >
                Results & Export
              </button>
            </nav>
          </div>
        </div>

        {/* Configuration View */}
        {selectedView === 'config' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration Panel */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Generation Configuration</h2>

              {/* Strand Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Curriculum Strands ({config.selectedStrands.length} selected)
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllStrands}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      Select All
                    </button>
                    <button
                      onClick={clearAllStrands}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                  {strands.map(strand => (
                    <label key={strand} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={config.selectedStrands.includes(strand)}
                        onChange={(e) => handleStrandSelection(strand, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{strand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Year Level Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Year Levels ({config.selectedYears.length} selected)
                </label>
                <div className="flex flex-wrap gap-2">
                  {YEARS.map(year => (
                    <label key={year} className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={config.selectedYears.includes(year)}
                        onChange={(e) => handleYearSelection(year, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Year {year}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sub-Level Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Sub-Levels ({config.selectedSubLevels.length} selected)
                </label>
                <div className="space-y-2">
                  {SUB_LEVELS.map(subLevel => (
                    <label key={subLevel} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={config.selectedSubLevels.includes(subLevel)}
                        onChange={(e) => handleSubLevelSelection(subLevel, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">
                        Level X.{subLevel} - {
                          subLevel === 1 ? 'Introductory' :
                          subLevel === 2 ? 'Developing' :
                          subLevel === 3 ? 'Standard' :
                          'Advanced'
                        }
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Questions per Combination */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Questions per Combination
                </label>
                <select
                  value={config.questionsPerCombination}
                  onChange={(e) => setConfig(prev => ({ ...prev, questionsPerCombination: parseInt(e.target.value) }))}
                  className="w-full p-2 border rounded-md bg-white"
                >
                  {[1, 2, 3, 5, 10].map(num => (
                    <option key={num} value={num}>{num} question{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              {/* Enhanced Difficulty Toggle */}
              <div className="mb-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.useEnhancedDifficulty}
                    onChange={(e) => setConfig(prev => ({ ...prev, useEnhancedDifficulty: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Use Enhanced Difficulty System (where available)
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Enhanced system supports: {ENHANCED_MODELS.join(', ')}
                </p>
              </div>

              {/* Generate Button */}
              <button
                onClick={startBulkGeneration}
                disabled={isGenerating || estimatedCombinations.length === 0}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                {isGenerating
                  ? 'Generating...'
                  : `Generate ${totalEstimated} Questions (${estimatedCombinations.length} combinations)`
                }
              </button>
            </div>

            {/* Preview Panel */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Generation Preview</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded-md">
                    <div className="font-medium text-blue-900">Valid Combinations</div>
                    <div className="text-2xl font-bold text-blue-700">{estimatedCombinations.length}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-md">
                    <div className="font-medium text-green-900">Total Questions</div>
                    <div className="text-2xl font-bold text-green-700">{totalEstimated}</div>
                  </div>
                </div>

                {estimatedCombinations.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Sample Combinations:</h3>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {estimatedCombinations.slice(0, 10).map((combo, index) => (
                        <div key={index} className="text-xs bg-gray-50 p-2 rounded border">
                          <div className="font-medium">{combo.strand} → {combo.substrand}</div>
                          <div className="text-gray-600">Year {combo.year}.{combo.subLevel} → {combo.primaryModel}</div>
                        </div>
                      ))}
                      {estimatedCombinations.length > 10 && (
                        <div className="text-xs text-gray-500 italic">
                          ...and {estimatedCombinations.length - 10} more combinations
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Progress View */}
        {selectedView === 'progress' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Generation Progress</h2>

            {generationResult && (
              <div className="space-y-6">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>
                      {generationPhase === 'preparing' && 'Preparing generation...'}
                      {generationPhase === 'generating' && `Generating: ${currentProgress} / ${generationResult.totalCombinations} combinations`}
                      {generationPhase === 'processing' && 'Processing results...'}
                      {generationPhase === 'completed' && `Completed: ${currentProgress} / ${generationResult.totalCombinations} combinations`}
                      {generationPhase === 'idle' && `Progress: ${currentProgress} / ${generationResult.totalCombinations} combinations`}
                    </span>
                    <span>
                      {generationPhase === 'preparing' && '0%'}
                      {generationPhase === 'processing' && '95%'}
                      {generationPhase === 'completed' && '100%'}
                      {(generationPhase === 'generating' || generationPhase === 'idle') &&
                        `${Math.round((currentProgress / generationResult.totalCombinations) * 100)}%`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        generationPhase === 'generating' ? 'bg-blue-600' :
                        generationPhase === 'processing' ? 'bg-yellow-500' :
                        generationPhase === 'completed' ? 'bg-green-600' :
                        'bg-gray-400'
                      }`}
                      style={{
                        width: `${
                          generationPhase === 'preparing' ? 5 :
                          generationPhase === 'processing' ? 95 :
                          generationPhase === 'completed' ? 100 :
                          (currentProgress / generationResult.totalCombinations) * 100
                        }%`
                      }}
                    ></div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 p-3 rounded-md text-center">
                    <div className="text-2xl font-bold text-green-700">{generationResult.totalQuestions}</div>
                    <div className="text-sm text-green-600">Questions Generated</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-md text-center">
                    <div className="text-2xl font-bold text-blue-700">{generationResult.completedCombinations}</div>
                    <div className="text-sm text-blue-600">Combinations Complete</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-md text-center">
                    <div className="text-2xl font-bold text-red-700">{generationResult.errors.length}</div>
                    <div className="text-sm text-red-600">Errors</div>
                  </div>
                </div>

                {/* Real-time Combination Status */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Combination Status</h3>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {generationResult.combinations.map((combo, index) => (
                      <div key={index} className={`p-3 rounded-md text-sm border ${
                        combo.status === 'completed' ? 'bg-green-50 border-green-200' :
                        combo.status === 'generating' ? 'bg-blue-50 border-blue-200' :
                        combo.status === 'error' ? 'bg-red-50 border-red-200' :
                        'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{combo.strand} → {combo.substrand}</span>
                            <span className="ml-2 text-gray-600">Year {combo.year}.{combo.subLevel}</span>
                            <span className="ml-2 text-gray-500">({combo.primaryModel})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {combo.status === 'completed' && (
                              <span className="text-green-600 font-medium">{combo.questionsGenerated} questions</span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              combo.status === 'completed' ? 'bg-green-100 text-green-700' :
                              combo.status === 'generating' ? 'bg-blue-100 text-blue-700' :
                              combo.status === 'error' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {combo.status === 'generating' ? '⏳ Generating...' :
                               combo.status === 'completed' ? '✅ Complete' :
                               combo.status === 'error' ? '❌ Error' :
                               '⏸️ Pending'}
                            </span>
                          </div>
                        </div>
                        {combo.error && (
                          <div className="mt-1 text-red-600 text-xs">{combo.error}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results View */}
        {selectedView === 'results' && generationResult && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Generation Complete</h2>
                <div className="flex gap-2">
                  <button
                    onClick={exportToCSV}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={exportToJSON}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                  >
                    Export JSON
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">{generationResult.totalQuestions}</div>
                  <div className="text-sm text-green-600">Questions Generated</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">{generationResult.completedCombinations}</div>
                  <div className="text-sm text-blue-600">Successful Combinations</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-700">{generationResult.errors.length}</div>
                  <div className="text-sm text-red-600">Failed Combinations</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700">
                    {generationResult.endTime && generationResult.startTime
                      ? `${Math.round((generationResult.endTime.getTime() - generationResult.startTime.getTime()) / 1000)}s`
                      : 'N/A'
                    }
                  </div>
                  <div className="text-sm text-purple-600">Total Time</div>
                </div>
              </div>

              {generationResult.errors.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium text-red-900 mb-2">Errors ({generationResult.errors.length})</h3>
                  <div className="max-h-32 overflow-y-auto bg-red-50 border border-red-200 rounded-md p-3">
                    {generationResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700 mb-1">{error}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Curriculum Coverage Component */}
            <CurriculumCoverage
              combinations={generationResult.combinations}
              config={config}
            />
          </div>
        )}
      </div>
    </div>
  );
}