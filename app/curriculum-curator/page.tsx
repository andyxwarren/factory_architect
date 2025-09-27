'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Grid,
  List,
  Save,
  Download,
  Upload,
  Eye,
  Settings,
  Target,
  Ban,
  Crown
} from 'lucide-react';

import {
  curatedMappingsManager,
  CuratedMapping,
  MappingMatrix,
  MappingStatus
} from '@/lib/curriculum/curated-mappings';
import { testTracker, TestSummary } from '@/lib/curriculum/test-tracking';
import { MODEL_STATUS_REGISTRY } from '@/lib/models/model-status';
import { CURRICULUM_DATA } from '@/context/curriculum';

interface CurationState {
  selectedStrand: string;
  selectedSubstrand: string;
  selectedYear: number;
  currentMapping: CuratedMapping | null;
  viewMode: 'matrix' | 'list' | 'details';
  showTestData: boolean;
}

const CurriculumCuratorPage = () => {
  const [state, setState] = useState<CurationState>({
    selectedStrand: '',
    selectedSubstrand: '',
    selectedYear: 1,
    currentMapping: null,
    viewMode: 'matrix',
    showTestData: false
  });

  const [matrix, setMatrix] = useState<MappingMatrix | null>(null);
  const [mappings, setMappings] = useState<CuratedMapping[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Get curriculum data
  const strands = Object.keys(CURRICULUM_DATA);
  const substrands = state.selectedStrand
    ? Object.keys(CURRICULUM_DATA[state.selectedStrand] || {})
    : [];
  const years = [1, 2, 3, 4, 5, 6];
  const models = Object.keys(MODEL_STATUS_REGISTRY);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (state.selectedStrand && state.selectedSubstrand && state.selectedYear) {
      const mapping = curatedMappingsManager.getMapping(
        state.selectedStrand,
        state.selectedSubstrand,
        state.selectedYear
      );
      setState(prev => ({ ...prev, currentMapping: mapping || null }));
    }
  }, [state.selectedStrand, state.selectedSubstrand, state.selectedYear]);

  const loadData = () => {
    // Build matrix
    const matrixData = curatedMappingsManager.buildMappingMatrix(
      strands,
      substrands.length > 0 ? substrands : Object.keys(CURRICULUM_DATA[strands[0]] || {}),
      years,
      models
    );
    setMatrix(matrixData);

    // Load mappings
    const allMappings = curatedMappingsManager.getAllMappings();
    setMappings(allMappings);

    // Load statistics
    const stats = curatedMappingsManager.getStatistics();
    setStatistics(stats);

    setUnsavedChanges(false);
  };

  const updateModelRole = (
    strand: string,
    substrand: string,
    year: number,
    modelId: string,
    role: 'primary' | 'secondary' | 'excluded' | 'none'
  ) => {
    curatedMappingsManager.batchUpdateModels([{
      strand,
      substrand,
      year,
      modelId,
      role
    }]);

    loadData();
    setUnsavedChanges(true);
  };

  const saveCurrentMapping = (updates: Partial<CuratedMapping>) => {
    if (state.selectedStrand && state.selectedSubstrand) {
      curatedMappingsManager.upsertMapping(
        state.selectedStrand,
        state.selectedSubstrand,
        state.selectedYear,
        updates
      );
      loadData();
      setUnsavedChanges(true);
    }
  };

  const getModelRoleInMapping = (
    strand: string,
    substrand: string,
    year: number,
    modelId: string
  ): 'primary' | 'secondary' | 'excluded' | 'none' => {
    const mapping = curatedMappingsManager.getMapping(strand, substrand, year);
    if (!mapping) return 'none';

    if (mapping.primaryModel === modelId) return 'primary';
    if (mapping.secondaryModels.includes(modelId)) return 'secondary';
    if (mapping.excludedModels.includes(modelId)) return 'excluded';
    return 'none';
  };

  const getTestSummary = (strand: string, substrand: string, year: number, modelId: string): TestSummary | null => {
    return testTracker.getSummary(strand, substrand, year, modelId);
  };

  const renderMatrixView = () => {
    if (!matrix) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Curation Matrix</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Primary</span>
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Secondary</span>
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Excluded</span>
              <div className="w-3 h-3 bg-gray-300 rounded"></div>
              <span>Unset</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setState(prev => ({ ...prev, showTestData: !prev.showTestData }))}
            >
              {state.showTestData ? 'Hide' : 'Show'} Test Data
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {strands.map(strand => {
            const strandSubstrands = Object.keys(CURRICULUM_DATA[strand] || {});
            return (
              <Card key={strand}>
                <CardHeader>
                  <CardTitle className="text-lg">{strand}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {strandSubstrands.map(substrand => (
                      <div key={substrand}>
                        <h4 className="font-medium mb-2 text-sm">{substrand}</h4>
                        <div className="grid grid-cols-6 gap-2">
                          {years.map(year => (
                            <div key={year} className="space-y-1">
                              <div className="text-xs text-center font-medium">Year {year}</div>
                              <div className="grid grid-cols-4 gap-1">
                                {models.slice(0, 8).map(modelId => {
                                  const role = getModelRoleInMapping(strand, substrand, year, modelId);
                                  const testSummary = state.showTestData ? getTestSummary(strand, substrand, year, modelId) : null;

                                  let bgColor = 'bg-gray-300';
                                  if (role === 'primary') bgColor = 'bg-blue-500';
                                  else if (role === 'secondary') bgColor = 'bg-green-500';
                                  else if (role === 'excluded') bgColor = 'bg-red-500';

                                  return (
                                    <button
                                      key={modelId}
                                      className={`w-6 h-6 rounded text-xs text-white hover:opacity-80 relative group ${bgColor}`}
                                      onClick={() => {
                                        const nextRole = role === 'none' ? 'primary' :
                                                       role === 'primary' ? 'secondary' :
                                                       role === 'secondary' ? 'excluded' :
                                                       'none';
                                        updateModelRole(strand, substrand, year, modelId, nextRole);
                                      }}
                                      title={`${MODEL_STATUS_REGISTRY[modelId]?.name || modelId} - ${role}`}
                                    >
                                      {role === 'primary' && <Crown className="w-3 h-3" />}
                                      {role === 'secondary' && <CheckCircle className="w-3 h-3" />}
                                      {role === 'excluded' && <Ban className="w-3 h-3" />}

                                      {state.showTestData && testSummary && testSummary.totalTests > 0 && (
                                        <div className="absolute -top-1 -right-1 bg-white text-black rounded-full w-3 h-3 text-xs flex items-center justify-center">
                                          {testSummary.totalTests}
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="space-y-4">
        {mappings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <List className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-gray-500">No curated mappings yet. Start by configuring some combinations in the matrix view.</p>
            </CardContent>
          </Card>
        ) : (
          mappings.map(mapping => (
            <Card key={mapping.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="font-medium">
                      {mapping.strand} → {mapping.substrand} (Year {mapping.year})
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-50">
                        Primary: {MODEL_STATUS_REGISTRY[mapping.primaryModel]?.name || mapping.primaryModel}
                      </Badge>
                      {mapping.secondaryModels.length > 0 && (
                        <Badge variant="outline" className="bg-green-50">
                          +{mapping.secondaryModels.length} secondary
                        </Badge>
                      )}
                      {mapping.excludedModels.length > 0 && (
                        <Badge variant="outline" className="bg-red-50">
                          {mapping.excludedModels.length} excluded
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Confidence: {mapping.confidence}</span>
                      <span>Status: {mapping.status}</span>
                      {mapping.averageRating && (
                        <span className="flex items-center gap-1">
                          Rating: {mapping.averageRating.toFixed(1)}
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setState(prev => ({
                        ...prev,
                        selectedStrand: mapping.strand,
                        selectedSubstrand: mapping.substrand,
                        selectedYear: mapping.year,
                        viewMode: 'details'
                      }));
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  };

  const renderDetailsView = () => {
    if (!state.currentMapping && (!state.selectedStrand || !state.selectedSubstrand)) {
      return (
        <Card>
          <CardContent className="text-center py-12">
            <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-gray-500">Select a curriculum combination to view or edit details.</p>
          </CardContent>
        </Card>
      );
    }

    const mapping = state.currentMapping;
    const isNewMapping = !mapping;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {isNewMapping ? 'Create New' : 'Edit'} Mapping: {state.selectedStrand} → {state.selectedSubstrand} (Year {state.selectedYear})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Model Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Primary Model</label>
              <Select
                value={mapping?.primaryModel || ''}
                onValueChange={(value) => saveCurrentMapping({ primaryModel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select primary model" />
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

            {/* Secondary Models */}
            <div>
              <label className="text-sm font-medium mb-2 block">Secondary Models</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {models.map(modelId => {
                  const isSecondary = mapping?.secondaryModels.includes(modelId) || false;
                  const isPrimary = mapping?.primaryModel === modelId;
                  const isExcluded = mapping?.excludedModels.includes(modelId) || false;

                  return (
                    <Button
                      key={modelId}
                      variant={isSecondary ? "default" : "outline"}
                      size="sm"
                      disabled={isPrimary || isExcluded}
                      onClick={() => {
                        const currentSecondary = mapping?.secondaryModels || [];
                        const newSecondary = isSecondary
                          ? currentSecondary.filter(m => m !== modelId)
                          : [...currentSecondary, modelId];
                        saveCurrentMapping({ secondaryModels: newSecondary });
                      }}
                      className="justify-start text-xs"
                    >
                      {isSecondary && <CheckCircle className="w-3 h-3 mr-1" />}
                      {MODEL_STATUS_REGISTRY[modelId]?.name || modelId}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Excluded Models */}
            <div>
              <label className="text-sm font-medium mb-2 block">Excluded Models</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {models.map(modelId => {
                  const isExcluded = mapping?.excludedModels.includes(modelId) || false;
                  const isPrimary = mapping?.primaryModel === modelId;
                  const isSecondary = mapping?.secondaryModels.includes(modelId) || false;

                  return (
                    <Button
                      key={modelId}
                      variant={isExcluded ? "destructive" : "outline"}
                      size="sm"
                      disabled={isPrimary || isSecondary}
                      onClick={() => {
                        const currentExcluded = mapping?.excludedModels || [];
                        const newExcluded = isExcluded
                          ? currentExcluded.filter(m => m !== modelId)
                          : [...currentExcluded, modelId];
                        saveCurrentMapping({ excludedModels: newExcluded });
                      }}
                      className="justify-start text-xs"
                    >
                      {isExcluded && <XCircle className="w-3 h-3 mr-1" />}
                      {MODEL_STATUS_REGISTRY[modelId]?.name || modelId}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Confidence Level */}
            <div>
              <label className="text-sm font-medium mb-2 block">Confidence Level</label>
              <Select
                value={mapping?.confidence || 'low'}
                onValueChange={(value: 'low' | 'medium' | 'high') => saveCurrentMapping({ confidence: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={mapping?.status || 'draft'}
                onValueChange={(value: 'draft' | 'approved' | 'needs_review') => saveCurrentMapping({ status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="needs_review">Needs Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium mb-2 block">Notes</label>
              <Textarea
                value={mapping?.notes || ''}
                onChange={(e) => saveCurrentMapping({ notes: e.target.value })}
                placeholder="Add notes about this mapping..."
                rows={3}
              />
            </div>

            {/* Test Data Summary */}
            {state.selectedStrand && state.selectedSubstrand && (
              <div>
                <label className="text-sm font-medium mb-2 block">Test Data Summary</label>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  {models.map(modelId => {
                    const summary = getTestSummary(state.selectedStrand, state.selectedSubstrand, state.selectedYear, modelId);
                    if (!summary || summary.totalTests === 0) return null;

                    return (
                      <div key={modelId} className="flex justify-between text-sm">
                        <span>{MODEL_STATUS_REGISTRY[modelId]?.name || modelId}</span>
                        <span>
                          {summary.totalTests} tests, avg rating: {summary.averageRating?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Curriculum Curator</h1>
          <p className="text-gray-600">Manage curated model-curriculum mappings</p>
        </div>
        <div className="flex gap-2">
          {unsavedChanges && (
            <Badge variant="outline" className="bg-yellow-50">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
          <Button variant="outline" onClick={() => {
            const data = curatedMappingsManager.exportMappings();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `curated-mappings-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold">{statistics.totalMappings}</div>
              <p className="text-xs text-gray-600">Total Mappings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-green-600">{statistics.approvedMappings}</div>
              <p className="text-xs text-gray-600">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-yellow-600">{statistics.draftMappings}</div>
              <p className="text-xs text-gray-600">Draft</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-orange-600">{statistics.needsReviewMappings}</div>
              <p className="text-xs text-gray-600">Needs Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{statistics.highConfidenceMappings}</div>
              <p className="text-xs text-gray-600">High Confidence</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={state.viewMode} onValueChange={(value: any) => setState(prev => ({ ...prev, viewMode: value }))}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="matrix" className="flex items-center gap-2">
            <Grid className="w-4 h-4" />
            Matrix
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            List
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matrix">
          {renderMatrixView()}
        </TabsContent>

        <TabsContent value="list">
          {renderListView()}
        </TabsContent>

        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Strand</label>
                  <Select value={state.selectedStrand} onValueChange={(value) =>
                    setState(prev => ({ ...prev, selectedStrand: value, selectedSubstrand: '' }))
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
                    value={state.selectedSubstrand}
                    onValueChange={(value) => setState(prev => ({ ...prev, selectedSubstrand: value }))}
                    disabled={!state.selectedStrand}
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
                  <Select value={state.selectedYear.toString()} onValueChange={(value) =>
                    setState(prev => ({ ...prev, selectedYear: parseInt(value) }))
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
              </CardContent>
            </Card>

            <div className="lg:col-span-3">
              {renderDetailsView()}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CurriculumCuratorPage;