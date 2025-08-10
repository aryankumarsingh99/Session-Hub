// Create: src/app/api/sessions/published/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb'; // ✅ Correct import
import Session from '@/models/Session';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    
    const skip = (page - 1) * limit;
    
    console.log('🔍 Fetching published sessions:', { page, limit });
    
    // Fetch only published sessions
    const [sessions, total] = await Promise.all([
      Session.find({ status: 'published' })
        .populate('user_id', 'firstName lastName avatar')
        .sort({ published_at: -1, created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Session.countDocuments({ status: 'published' })
    ]);
    
    // Format sessions for frontend
    const formattedSessions = sessions.map(session => ({
      ...session,
      id: session._id.toString(),
      _id: session._id.toString(),
      user_id: session.user_id ? {
        id: session.user_id._id.toString(),
        firstName: session.user_id.firstName,
        lastName: session.user_id.lastName,
        avatar: session.user_id.avatar
      } : null,
      author: session.user_id ? {
        name: `${session.user_id.firstName} ${session.user_id.lastName}`,
        firstName: session.user_id.firstName,
        lastName: session.user_id.lastName,
        avatar: session.user_id.avatar
      } : {
        name: 'Unknown User',
        firstName: 'Unknown',
        lastName: 'User'
      },
      views: session.views || 0,
      likes: session.likes || 0,
      tags: session.tags || []
    }));
    
    return NextResponse.json({
      success: true,
      sessions: formattedSessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    console.error('❌ Published Sessions API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch published sessions'
    }, { status: 500 });
  }
}