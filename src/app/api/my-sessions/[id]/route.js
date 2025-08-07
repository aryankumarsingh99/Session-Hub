// src/app/api/my-sessions/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Session from '@/models/Session';
import { extractTokenFromRequest, verifyToken } from '@/lib/jwt';

export async function GET(request, { params }) {
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

    const session = await Session.findOne({ 
      _id: params.id, 
      user_id: payload.userId 
    }).lean();

    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Session not found or access denied'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      session: {
        ...session,
        _id: session._id.toString(),
        user_id: session.user_id.toString()
      }
    });

  } catch (error) {
    console.error('❌ Get Session: Error fetching session:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch session'
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
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

    const session = await Session.findOneAndDelete({ 
      _id: params.id, 
      user_id: payload.userId 
    });

    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Session not found or access denied'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete Session: Error deleting session:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete session'
    }, { status: 500 });
  }
}