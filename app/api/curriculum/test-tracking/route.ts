/**
 * API endpoints for curriculum test tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { testTracker, TestResult } from '@/lib/curriculum/test-tracking';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'all':
        return NextResponse.json({ results: testTracker.getAllResults() });

      case 'summary':
        const strand = searchParams.get('strand');
        const substrand = searchParams.get('substrand');
        const year = searchParams.get('year');
        const modelId = searchParams.get('modelId');

        if (!strand || !substrand || !year || !modelId) {
          return NextResponse.json(
            { error: 'Missing required parameters: strand, substrand, year, modelId' },
            { status: 400 }
          );
        }

        const summary = testTracker.getSummary(strand, substrand, parseInt(year), modelId);
        return NextResponse.json({ summary });

      case 'progress':
        const strands = searchParams.get('strands')?.split(',') || [];
        const substrands = searchParams.get('substrands')?.split(',') || [];
        const years = searchParams.get('years')?.split(',').map(Number) || [];
        const models = searchParams.get('models')?.split(',') || [];

        const progress = testTracker.getProgress(strands, substrands, years, models);
        return NextResponse.json({ progress });

      case 'export':
        const exportData = testTracker.exportResults();
        return new NextResponse(exportData, {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="test-results-${new Date().toISOString().split('T')[0]}.json"`
          }
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: all, summary, progress, or export' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in test tracking GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'add':
        const {
          strand,
          substrand,
          year,
          modelId,
          questionGenerated,
          parameters,
          success,
          rating,
          notes,
          generationTime,
          errorMessage,
          sessionId,
          testerName
        } = body;

        if (!strand || !substrand || !year || !modelId) {
          return NextResponse.json(
            { error: 'Missing required fields: strand, substrand, year, modelId' },
            { status: 400 }
          );
        }

        const testResult = testTracker.addTestResult({
          strand,
          substrand,
          year,
          modelId,
          questionGenerated: questionGenerated || '',
          parameters: parameters || {},
          success: success || false,
          rating,
          notes,
          generationTime,
          errorMessage,
          sessionId,
          testerName
        });

        return NextResponse.json({ result: testResult });

      case 'update-rating':
        const { testId, newRating, newNotes } = body;

        if (!testId || !newRating) {
          return NextResponse.json(
            { error: 'Missing required fields: testId, newRating' },
            { status: 400 }
          );
        }

        testTracker.updateRating(testId, newRating, newNotes);
        return NextResponse.json({ success: true });

      case 'import':
        const { data } = body;
        if (!data) {
          return NextResponse.json(
            { error: 'Missing data field' },
            { status: 400 }
          );
        }

        testTracker.importResults(data);
        return NextResponse.json({ success: true });

      case 'clear':
        // This is a destructive action, could add additional confirmation
        testTracker.clearAllResults();
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: add, update-rating, import, or clear' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in test tracking POST:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function PUT(request: NextRequest) {
  return POST(request); // Alias PUT to POST for convenience
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');

    if (!testId) {
      return NextResponse.json(
        { error: 'Missing testId parameter' },
        { status: 400 }
      );
    }

    // Note: testTracker doesn't have a delete method yet
    // Could be implemented if needed
    return NextResponse.json(
      { error: 'Delete operation not implemented' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error in test tracking DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}