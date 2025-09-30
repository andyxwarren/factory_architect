'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  Clock,
  Play,
  RotateCcw,
  Download,
  Upload,
  Star,
  TrendingUp,
  Filter,
  Eye
} from 'lucide-react';

import { testTracker, TestResult, TestSummary, TestingProgress } from '@/lib/curriculum/test-tracking';
import { MODEL_STATUS_REGISTRY } from '@/lib/models/model-status';
import { CURRICULUM_DATA } from '@/context/curriculum';

interface TestingState {
  selectedStrand: string;
  selectedSubstrand: string;
  selectedYear: number;
  selectedModel: string;
  isGenerating: boolean;
  currentQuestion: string | null;
  currentParameters: any;
  generationTime: number | null;
  generationError: string | null;
  showRating: boolean;
  currentTestId: string | null;
}

const CurriculumTesterPage = () => {
  const [testingState, setTestingState] = useState<TestingState>({
    selectedStrand: '',
    selectedSubstrand: '',
    selectedYear: 1,
    selectedModel: '',
    isGenerating: false,
    currentQuestion: null,
    currentParameters: null,
    generationTime: null,
    generationError: null,
    showRating: false,
    currentTestId: null
  });

  const [progress, setProgress] = useState<TestingProgress | null>(null);
  const [currentSummary, setCurrentSummary] = useState<TestSummary | null>(null);
  const [recentTests, setRecentTests] = useState<TestResult[]>([]);
  const [viewMode, setViewMode] = useState<'testing' | 'progress' | 'results'>('testing');

  // Get curriculum data
  const strands = Object.keys(CURRICULUM_DATA);
  const substrands = testingState.selectedStrand
    ? Object.keys(CURRICULUM_DATA[testingState.selectedStrand] || {})
    : [];
  const years = [1, 2, 3, 4, 5, 6];
  const models = Object.keys(MODEL_STATUS_REGISTRY);

  // Update progress when component mounts or data changes
  useEffect(() => {
    updateProgress();
    updateRecentTests();
  }, []);

  // Update summary when selection changes
  useEffect(() => {
    if (testingState.selectedStrand && testingState.selectedSubstrand && testingState.selectedModel) {
      const summary = testTracker.getSummary(
        testingState.selectedStrand,
        testingState.selectedSubstrand,
        testingState.selectedYear,
        testingState.selectedModel
      );
      setCurrentSummary(summary);
    } else {
      setCurrentSummary(null);
    }
  }, [testingState.selectedStrand, testingState.selectedSubstrand, testingState.selectedYear, testingState.selectedModel]);

  const updateProgress = () => {
    const progressData = testTracker.getProgress(strands, substrands, years, models);
    setProgress(progressData);
  };

  const updateRecentTests = () => {
    const recent = testTracker.getAllResults()
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 20);
    setRecentTests(recent);
  };

  const generateQuestion = async () => {
    if (!testingState.selectedStrand || !testingState.selectedSubstrand || !testingState.selectedModel) {
      return;
    }

    setTestingState(prev => ({
      ...prev,
      isGenerating: true,
      currentQuestion: null,
      generationError: null,
      generationTime: null,
      showRating: false
    }));

    const startTime = Date.now();

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model_id: testingState.selectedModel,
          difficulty_level: `${testingState.selectedYear}.2`, // Use enhanced difficulty format (X.2 = Developing)
          context_type: 'money'
        })
      });

      const endTime = Date.now();
      const generationTime = endTime - startTime;

      if (response.ok) {
        const result = await response.json();

        // Record successful test
        const testResult = testTracker.addTestResult({
          strand: testingState.selectedStrand,
          substrand: testingState.selectedSubstrand,
          year: testingState.selectedYear,
          modelId: testingState.selectedModel,
          questionGenerated: result.question || 'Question generated successfully',
          parameters: result.parameters || {},
          success: true,
          generationTime
        });

        setTestingState(prev => ({
          ...prev,
          isGenerating: false,
          currentQuestion: result.question || 'Question generated successfully',
          currentParameters: result.parameters || {},
          generationTime,
          showRating: true,
          currentTestId: testResult.id
        }));
      } else {
        const error = await response.text();

        // Record failed test
        testTracker.addTestResult({
          strand: testingState.selectedStrand,
          substrand: testingState.selectedSubstrand,
          year: testingState.selectedYear,
          modelId: testingState.selectedModel,
          questionGenerated: '',
          parameters: {},
          success: false,
          generationTime,
          errorMessage: error
        });

        setTestingState(prev => ({
          ...prev,
          isGenerating: false,
          generationError: error
        }));
      }

      // Update progress and recent tests
      updateProgress();
      updateRecentTests();

    } catch (error) {
      const endTime = Date.now();
      const generationTime = endTime - startTime;

      testTracker.addTestResult({
        strand: testingState.selectedStrand,
        substrand: testingState.selectedSubstrand,
        year: testingState.selectedYear,
        modelId: testingState.selectedModel,
        questionGenerated: '',
        parameters: {},
        success: false,
        generationTime,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      setTestingState(prev => ({
        ...prev,
        isGenerating: false,
        generationError: error instanceof Error ? error.message : 'Unknown error'
      }));

      updateProgress();
      updateRecentTests();
    }
  };

  const submitRating = (rating: 1 | 2 | 3 | 4 | 5, notes?: string) => {
    if (testingState.currentTestId) {
      testTracker.updateRating(testingState.currentTestId, rating, notes);
      setTestingState(prev => ({ ...prev, showRating: false, currentTestId: null }));
      updateProgress();
      updateRecentTests();
    }
  };

  const exportResults = () => {
    const data = testTracker.exportResults();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-results-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: TestSummary['recommendedStatus']) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'needs_review': return 'bg-yellow-500';
      case 'testing': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: TestSummary['recommendedStatus']) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'needs_review': return 'Needs Review';
      case 'testing': return 'Testing';
      default: return 'Untested';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Curriculum Testing Center</h1>
          <p className="text-gray-600">Test mathematical models against curriculum combinations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportResults}>
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </Button>
        </div>
      </div>

      <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Testing
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="testing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Selection Panel */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Test Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Strand</label>
                  <Select value={testingState.selectedStrand} onValueChange={(value) =>
                    setTestingState(prev => ({ ...prev, selectedStrand: value, selectedSubstrand: '' }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select strand" />
                    </SelectTrigger>
                    <SelectContent>
                      {strands.map(strand => (
                        <SelectItem key={strand} value={strand}>{strand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Substrand</label>
                  <Select
                    value={testingState.selectedSubstrand}
                    onValueChange={(value) => setTestingState(prev => ({ ...prev, selectedSubstrand: value }))}
                    disabled={!testingState.selectedStrand}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select substrand" />
                    </SelectTrigger>
                    <SelectContent>
                      {substrands.map(substrand => (
                        <SelectItem key={substrand} value={substrand}>{substrand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Year</label>
                  <Select value={testingState.selectedYear.toString()} onValueChange={(value) =>
                    setTestingState(prev => ({ ...prev, selectedYear: parseInt(value) }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>Year {year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Model</label>
                  <Select value={testingState.selectedModel} onValueChange={(value) =>
                    setTestingState(prev => ({ ...prev, selectedModel: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map(modelId => (
                        <SelectItem key={modelId} value={modelId}>
                          {MODEL_STATUS_REGISTRY[modelId]?.name || modelId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={generateQuestion}
                  disabled={testingState.isGenerating || !testingState.selectedStrand || !testingState.selectedSubstrand || !testingState.selectedModel}
                  className="w-full"
                >
                  {testingState.isGenerating ? (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Generate Question
                    </>
                  )}
                </Button>

                {currentSummary && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Current Combination</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tests:</span>
                        <span>{currentSummary.totalTests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Success:</span>
                        <span>{currentSummary.successfulTests}/{currentSummary.totalTests}</span>
                      </div>
                      {currentSummary.averageRating && (
                        <div className="flex justify-between">
                          <span>Avg Rating:</span>
                          <span className="flex items-center gap-1">
                            {currentSummary.averageRating.toFixed(1)}
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge variant="outline" className={`${getStatusColor(currentSummary.recommendedStatus)} text-white`}>
                          {getStatusText(currentSummary.recommendedStatus)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                {testingState.isGenerating ? (
                  <div className="flex items-center justify-center py-12">
                    <RotateCcw className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="ml-3">Generating question...</span>
                  </div>
                ) : testingState.currentQuestion ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-medium text-green-800 mb-2">Question Generated Successfully</h4>
                          <p className="text-gray-700">{testingState.currentQuestion}</p>
                        </div>
                      </div>
                    </div>

                    {testingState.generationTime && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        Generated in {testingState.generationTime}ms
                      </div>
                    )}

                    {testingState.showRating && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-3">Rate this question's appropriateness</h4>
                        <div className="flex gap-2 mb-4">
                          {[1, 2, 3, 4, 5].map(rating => (
                            <Button
                              key={rating}
                              variant="outline"
                              size="sm"
                              onClick={() => submitRating(rating as 1 | 2 | 3 | 4 | 5)}
                              className="flex items-center gap-1"
                            >
                              {rating}
                              <Star className="w-3 h-3" />
                            </Button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">1 = Poor fit, 5 = Perfect fit for curriculum area</p>
                      </div>
                    )}
                  </div>
                ) : testingState.generationError ? (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-500 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-medium text-red-800 mb-2">Generation Failed</h4>
                        <p className="text-gray-700 text-sm">{testingState.generationError}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Play className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Select a curriculum combination and model, then click "Generate Question" to begin testing.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {progress && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{progress.testedCombinations}</div>
                  <p className="text-xs text-gray-600">Combinations Tested</p>
                  <Progress value={(progress.testedCombinations / progress.totalCombinations) * 100} className="mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">{progress.approvedCombinations}</div>
                  <p className="text-xs text-gray-600">Approved Combinations</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-600">{progress.rejectedCombinations}</div>
                  <p className="text-xs text-gray-600">Rejected Combinations</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600">{progress.totalCombinations}</div>
                  <p className="text-xs text-gray-600">Total Combinations</p>
                </CardContent>
              </Card>
            </div>
          )}

          {progress && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Progress by Year</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(progress.byYear).map(([year, stats]) => (
                      <div key={year}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Year {year}</span>
                          <span>{stats.tested}/{stats.total}</span>
                        </div>
                        <Progress value={(stats.tested / stats.total) * 100} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Progress by Model</CardTitle>
                </CardHeader>
                <CardContent className="max-h-80 overflow-y-auto">
                  <div className="space-y-4">
                    {Object.entries(progress.byModel)
                      .sort(([, a], [, b]) => (b.tested / b.total) - (a.tested / a.total))
                      .map(([modelId, stats]) => (
                        <div key={modelId}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="truncate">{MODEL_STATUS_REGISTRY[modelId]?.name || modelId}</span>
                            <span>{stats.tested}/{stats.total}</span>
                          </div>
                          <Progress value={(stats.tested / stats.total) * 100} />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentTests.map(test => (
                  <div key={test.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    {test.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {test.strand} → {test.substrand} (Year {test.year})
                      </div>
                      <div className="text-xs text-gray-500">
                        {MODEL_STATUS_REGISTRY[test.modelId]?.name || test.modelId}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {test.rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-sm">{test.rating}</span>
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        {test.generationTime}ms
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CurriculumTesterPage;