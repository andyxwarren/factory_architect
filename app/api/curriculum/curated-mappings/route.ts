/**
 * API endpoints for curated curriculum-model mappings
 */

import { NextRequest, NextResponse } from 'next/server';
import { curatedMappingsManager, CuratedMapping } from '@/lib/curriculum/curated-mappings';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'all':
        const mappings = curatedMappingsManager.getAllMappings();
        return NextResponse.json({ mappings });

      case 'get':
        const strand = searchParams.get('strand');
        const substrand = searchParams.get('substrand');
        const year = searchParams.get('year');

        if (!strand || !substrand || !year) {
          return NextResponse.json(
            { error: 'Missing required parameters: strand, substrand, year' },
            { status: 400 }
          );
        }

        const mapping = curatedMappingsManager.getMapping(strand, substrand, parseInt(year));
        return NextResponse.json({ mapping });

      case 'suggested':
        const filterStrand = searchParams.get('strand');
        const filterSubstrand = searchParams.get('substrand');
        const filterYear = searchParams.get('year');
        const description = searchParams.get('description') || '';

        if (!filterStrand || !filterSubstrand || !filterYear) {
          return NextResponse.json(
            { error: 'Missing required parameters: strand, substrand, year' },
            { status: 400 }
          );
        }

        const suggested = curatedMappingsManager.getSuggestedModels({
          strand: filterStrand,
          substrand: filterSubstrand,
          year: parseInt(filterYear),
          description
        });
        return NextResponse.json({ suggested });

      case 'matrix':
        const matrixStrands = searchParams.get('strands')?.split(',') || [];
        const matrixSubstrands = searchParams.get('substrands')?.split(',') || [];
        const matrixYears = searchParams.get('years')?.split(',').map(Number) || [];
        const matrixModels = searchParams.get('models')?.split(',') || [];

        const matrix = curatedMappingsManager.buildMappingMatrix(
          matrixStrands,
          matrixSubstrands,
          matrixYears,
          matrixModels
        );
        return NextResponse.json({ matrix });

      case 'statistics':
        const statistics = curatedMappingsManager.getStatistics();
        return NextResponse.json({ statistics });

      case 'export':
        const exportData = curatedMappingsManager.exportMappings();
        return new NextResponse(exportData, {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="curated-mappings-${new Date().toISOString().split('T')[0]}.json"`
          }
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: all, get, suggested, matrix, statistics, or export' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in curated mappings GET:', error);
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
      case 'upsert':
        const {
          strand,
          substrand,
          year,
          primaryModel,
          secondaryModels,
          excludedModels,
          confidence,
          notes,
          status,
          approvedBy,
          testedCount,
          averageRating
        } = body;

        if (!strand || !substrand || !year) {
          return NextResponse.json(
            { error: 'Missing required fields: strand, substrand, year' },
            { status: 400 }
          );
        }

        const updates: Partial<CuratedMapping> = {};
        if (primaryModel !== undefined) updates.primaryModel = primaryModel;
        if (secondaryModels !== undefined) updates.secondaryModels = secondaryModels;
        if (excludedModels !== undefined) updates.excludedModels = excludedModels;
        if (confidence !== undefined) updates.confidence = confidence;
        if (notes !== undefined) updates.notes = notes;
        if (status !== undefined) updates.status = status;
        if (approvedBy !== undefined) updates.approvedBy = approvedBy;
        if (testedCount !== undefined) updates.testedCount = testedCount;
        if (averageRating !== undefined) updates.averageRating = averageRating;

        const mapping = curatedMappingsManager.upsertMapping(
          strand,
          substrand,
          year,
          updates
        );

        return NextResponse.json({ mapping });

      case 'batch-update':
        const { updates: batchUpdates } = body;

        if (!Array.isArray(batchUpdates)) {
          return NextResponse.json(
            { error: 'Updates must be an array' },
            { status: 400 }
          );
        }

        curatedMappingsManager.batchUpdateModels(batchUpdates);
        return NextResponse.json({ success: true });

      case 'approve':
        const { mappingId, approver } = body;

        if (!mappingId || !approver) {
          return NextResponse.json(
            { error: 'Missing required fields: mappingId, approver' },
            { status: 400 }
          );
        }

        curatedMappingsManager.approveMapping(mappingId, approver);
        return NextResponse.json({ success: true });

      case 'mark-for-review':
        const { reviewMappingId } = body;

        if (!reviewMappingId) {
          return NextResponse.json(
            { error: 'Missing required field: reviewMappingId' },
            { status: 400 }
          );
        }

        curatedMappingsManager.markForReview(reviewMappingId);
        return NextResponse.json({ success: true });

      case 'import':
        const { data } = body;
        if (!data) {
          return NextResponse.json(
            { error: 'Missing data field' },
            { status: 400 }
          );
        }

        curatedMappingsManager.importMappings(data);
        return NextResponse.json({ success: true });

      case 'clear':
        // This is a destructive action, could add additional confirmation
        curatedMappingsManager.clearAllMappings();
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: upsert, batch-update, approve, mark-for-review, import, or clear' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in curated mappings POST:', error);
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

export async function PATCH(request: NextRequest) {
  return POST(request); // Alias PATCH to POST for convenience
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'mapping':
        const strand = searchParams.get('strand');
        const substrand = searchParams.get('substrand');
        const year = searchParams.get('year');

        if (!strand || !substrand || !year) {
          return NextResponse.json(
            { error: 'Missing required parameters: strand, substrand, year' },
            { status: 400 }
          );
        }

        // Note: curatedMappingsManager doesn't have a delete method yet
        // Could be implemented if needed
        return NextResponse.json(
          { error: 'Delete mapping operation not implemented' },
          { status: 501 }
        );

      case 'all':
        curatedMappingsManager.clearAllMappings();
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: mapping or all' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in curated mappings DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}