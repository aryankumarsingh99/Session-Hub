import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Session from '@/models/Session';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'updated_at';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    
    console.log('🔍 Fetching public sessions:', { page, limit, category, difficulty, search, sortBy });
    
    // Build query for published sessions only
    const query = { status: 'published' };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder;
    
    // Fetch sessions with pagination
    const [sessions, total] = await Promise.all([
      Session.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Session.countDocuments(query)
    ]);

    console.log(`✅ Found ${sessions.length} public sessions`);

    // Increment view count for sessions (optional)
    if (sessions.length > 0) {
      await Session.updateMany(
        { _id: { $in: sessions.map(s => s._id) } },
        { $inc: { views: 1 } }
      );
    }

    return NextResponse.json({
      success: true,
      sessions: sessions.map(s => ({
        ...s,
        id: s._id.toString(),
        _id: s._id.toString(),
        user_id: s.user_id.toString(),
        views: (s.views || 0) + 1, // Include the increment
        likes: s.likes || 0,
        tags: s.tags || []
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      filters: {
        categories: await Session.distinct('category', { status: 'published' }),
        difficulties: await Session.distinct('difficulty', { status: 'published' })
      }
    });
  } catch (error) {
    console.error('❌ Public Sessions Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch sessions' 
    }, { status: 500 });
  }
}