// src/app/api/my-sessions/save-draft/route.js
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
    const { title, description, tags, json_file_url, sessionId, status } = body;

    // Validate required fields
    if (!title?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Title is required'
      }, { status: 400 });
    }

    if (!json_file_url?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'JSON file URL is required'
      }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(json_file_url);
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Please provide a valid URL'
      }, { status: 400 });
    }

    const updateData = {
      title: title.trim(),
      description: description?.trim() || '',
      tags: Array.isArray(tags) ? tags.map(tag => tag.trim()) : [],
      json_file_url: json_file_url.trim(),
      status: status || 'draft', // Force to draft or use provided status
      updated_at: new Date()
    };

    if (sessionId) {
      // Update existing session
      const session = await Session.findOneAndUpdate(
        { _id: sessionId, user_id: payload.userId },
        updateData,
        { new: true, runValidators: true }
      );

      if (!session) {
        return NextResponse.json({
          success: false,
          error: 'Session not found or access denied'
        }, { status: 404 });
      }

      console.log(`✅ Session updated: ${session.title} (${session.status})`);

      return NextResponse.json({
        success: true,
        message: `Session ${status === 'draft' ? 'saved as draft' : 'updated'} successfully`,
        session: {
          ...session.toObject(),
          _id: session._id.toString(),
          user_id: session.user_id.toString()
        }
      });
    } else {
      // Create new session
      const session = new Session({
        user_id: payload.userId,
        ...updateData
      });

      await session.save();

      console.log(`✅ New session created: ${session.title} (${session.status})`);

      return NextResponse.json({
        success: true,
        message: 'Session created successfully',
        session: {
          ...session.toObject(),
          _id: session._id.toString(),
          user_id: session.user_id.toString()
        }
      }, { status: 201 });
    }

  } catch (error) {
    console.error('❌ Save Draft: Error saving session:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({
        success: false,
        error: messages.join(', ')
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to save session'
    }, { status: 500 });
  }
}