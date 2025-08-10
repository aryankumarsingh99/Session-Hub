import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Session from '@/models/Session';
import { extractTokenFromRequest, verifyToken } from '@/lib/jwt';

export async function GET(request) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) return NextResponse.json({ success: false, error: 'Auth required' }, { status: 401 });
    
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'updated_at';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    
    console.log('🔍 Fetching user sessions:', { 
      userId: payload.userId, 
      status, 
      page, 
      limit, 
      sortBy, 
      sortOrder 
    });
    
    // Build query
    const query = { user_id: payload.userId };
    if (status !== 'all') {
      query.status = status;
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

    console.log(`✅ Found ${sessions.length} user sessions`);

    return NextResponse.json({
      success: true,
      sessions: sessions.map(s => ({
        ...s,
        id: s._id.toString(),
        _id: s._id.toString(),
        user_id: s.user_id.toString(),
        views: s.views || 0,
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
      stats: {
        totalSessions: total,
        draftSessions: await Session.countDocuments({ user_id: payload.userId, status: 'draft' }),
        publishedSessions: await Session.countDocuments({ user_id: payload.userId, status: 'published' })
      }
    });
  } catch (error) {
    console.error('❌ My Sessions Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch sessions' 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) return NextResponse.json({ success: false, error: 'Auth required' }, { status: 401 });
    
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

    await dbConnect();
    const body = await request.json();
    
    console.log('📝 Creating new session:', { userId: payload.userId, title: body.title });
    
    // Create new session
    const session = new Session({
      ...body,
      user_id: payload.userId,
      status: body.status || 'draft',
      created_at: new Date(),
      updated_at: new Date()
    });
    
    await session.save();
    
    console.log('✅ Session created successfully:', session._id);
    
    return NextResponse.json({
      success: true,
      message: 'Session created successfully',
      session: {
        ...session.toObject(),
        id: session._id.toString(),
        _id: session._id.toString(),
        user_id: session.user_id.toString()
      }
    });
  } catch (error) {
    console.error('❌ Create Session Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create session' 
    }, { status: 500 });
  }
}