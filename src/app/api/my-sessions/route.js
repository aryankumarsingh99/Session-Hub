// src/app/api/my-sessions/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Session from '@/models/Session';
import { extractTokenFromRequest, verifyToken } from '@/lib/jwt';

export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

   
    const query = { user_id: payload.userId };
    if (status !== 'all') {
      query.status = status;
    }

    const skip = (page - 1) * limit;

  
    const [sessions, total] = await Promise.all([
      Session.find(query)
        .sort({ updated_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Session.countDocuments(query)
    ]);

    const formattedSessions = sessions.map(session => ({
      ...session,
      _id: session._id.toString(),
      user_id: session.user_id.toString()
    }));

    return NextResponse.json({
      success: true,
      sessions: formattedSessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error(' My Sessions: Error fetching user sessions:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch sessions'
    }, { status: 500 });
  }
}

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
    const { title, description, tags, json_file_url, status = 'draft' } = body;

 
    if (!title || !json_file_url) {
      return NextResponse.json({
        success: false,
        error: 'Title and JSON file URL are required'
      }, { status: 400 });
    }

 
    const session = new Session({
      user_id: payload.userId,
      title: title.trim(),
      description: description?.trim(),
      tags: Array.isArray(tags) ? tags.map(tag => tag.trim()) : [],
      json_file_url: json_file_url.trim(),
      status
    });

    await session.save();

    return NextResponse.json({
      success: true,
      message: 'Session created successfully',
      session: {
        ...session.toObject(),
        _id: session._id.toString(),
        user_id: session.user_id.toString()
      }
    }, { status: 201 });

  } catch (error) {
    console.error(' My Sessions: Error creating session:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({
        success: false,
        error: messages.join(', ')
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create session'
    }, { status: 500 });
  }
}