// Create: src/app/api/sessions/published/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Session from '@/models/Session';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'newest';
    
    // Only fetch published sessions
    let query = Session.find({ 
      status: 'published' 
    }).populate('user_id', 'firstName lastName');
    
    // Apply sorting
    switch (sortBy) {
      case 'oldest':
        query = query.sort({ created_at: 1 });
        break;
      case 'views':
        query = query.sort({ views: -1 });
        break;
      case 'title':
        query = query.sort({ title: 1 });
        break;
      case 'newest':
      default:
        query = query.sort({ created_at: -1 });
        break;
    }
    
    const sessions = await query.exec();
    
    // Transform data to match your frontend expectations
    const formattedSessions = sessions.map(session => ({
      _id: session._id,
      title: session.title,
      description: session.description,
      tags: session.tags || [],
      views: session.views,
      status: session.status,
      author: {
        firstName: session.user_id?.firstName || 'Unknown',
        lastName: session.user_id?.lastName || 'User'
      },
      createdAt: session.created_at,
      duration: 30 // Default duration, update based on your schema
    }));
    
    return NextResponse.json({
      success: true,
      sessions: formattedSessions,
      message: 'Published sessions fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching published sessions:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch published sessions',
        sessions: []
      },
      { status: 500 }
    );
  }
}