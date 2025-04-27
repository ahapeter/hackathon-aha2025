import { NextRequest, NextResponse } from 'next/server';
import { StoreService } from '@/shared/services/storeService';
import { GameEvent, GameScore } from '@/shared/types/store';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const presentationId = searchParams.get('presentationId');
    const slideId = searchParams.get('slideId');

    if (!presentationId || !slideId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const gameStore = StoreService.getGameStore(presentationId, slideId);
    return NextResponse.json(gameStore);
  } catch (error) {
    console.error('GET game state error:', error);
    return NextResponse.json(
      { error: 'Failed to get game state' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { presentationId, slideId, config } = body;

    if (!presentationId || !slideId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log('Initializing game with:', { presentationId, slideId, config });
    StoreService.initializeGame(presentationId, slideId, 'swipee', config);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST game state error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize game' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { presentationId, slideId, type, data } = body;

    if (!presentationId || !slideId || !type || !data) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (type === 'event') {
      const event = data as GameEvent;
      StoreService.addGameEvent(presentationId, slideId, event);
    } else if (type === 'score') {
      const score = data as GameScore;
      StoreService.addGameScore(presentationId, slideId, score);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT game state error:', error);
    return NextResponse.json(
      { error: 'Failed to update game state' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const presentationId = searchParams.get('presentationId');
    const slideId = searchParams.get('slideId');

    if (!presentationId || !slideId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    StoreService.deleteGame(presentationId, slideId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE game state error:', error);
    return NextResponse.json(
      { error: 'Failed to delete game state' },
      { status: 500 }
    );
  }
} 