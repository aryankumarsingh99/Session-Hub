 
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
        error: 'Auth required'
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
    let session;
    if (body.id) {
      session = await Session.findOneAndUpdate(
        { _id: body.id, user_id: payload.userId },
        { ...body, status: 'published', published_at: new Date(), updated_at: new Date() },
        { new: true, runValidators: true }
      ).lean();
    } else {
      session = new Session({
        ...body,
        user_id: payload.userId,
        status: 'published',
        published_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      });
      await session.save();
      session = session.toObject();
    }
    return NextResponse.json({
      success: true,
      session: {
        ...session,
        id: session._id.toString(),
        _id: session._id.toString(),
        user_id: session.user_id.toString()
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to publish session'
    }, { status: 500 });
  }
}