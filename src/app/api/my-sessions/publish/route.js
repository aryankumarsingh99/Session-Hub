// src/app/api/my-sessions/publish/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Session from '@/models/Session';
import { extractTokenFromRequest, verifyToken } from '@/lib/jwt';

export async function POST(request) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token'
      }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'Session ID is required'
      }, { status: 400 });
    }

    // Find session and verify ownership
    const session = await Session.findOne({ 
      _id: sessionId, 
      user_id: payload.userId 
    });

    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Session not found or access denied'
      }, { status: 404 });
    }

    // Update session status
    session.status = 'published';
    if (!session.published_at) {
      session.published_at = new Date();
    }
    await session.save();

    return NextResponse.json({
      success: true,
      message: 'Session published successfully',
      session: {
        ...session.toObject(),
        _id: session._id.toString(),
        user_id: session.user_id.toString()
      }
    });

  } catch (error) {
    console.error('❌ Publish Session: Error publishing session:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to publish session'
    }, { status: 500 });
  }
}