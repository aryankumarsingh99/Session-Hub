 
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Session from '@/models/Session';
import { extractTokenFromRequest, verifyToken } from '@/lib/jwt';

export async function POST(request) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) return NextResponse.json({ success: false, error: 'Auth required' }, { status: 401 });
    
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

    await dbConnect();
    const body = await request.json();

    console.log('Save draft request:', { 
      userId: payload.userId, 
      sessionId: body.id || 'new',
      title: body.title || 'Untitled'
    });

    let session;

    if (body.id) {
      
      session = await Session.findOneAndUpdate(
        { 
          _id: body.id, 
          user_id: payload.userId,
          status: 'draft'  
        },
        { 
          ...body,
          status: 'draft',
          updated_at: new Date()
        },
        { 
          new: true, 
          runValidators: false, 
          upsert: false
        }
      ).lean();

      if (!session) {
        return NextResponse.json({
          success: false,
          error: 'Draft not found or cannot be updated'
        }, { status: 404 });
      }

      console.log(' Draft updated:', session.title);
    } else {
 
      const newSession = new Session({
        ...body,
        user_id: payload.userId,
        status: 'draft',
        created_at: new Date(),
        updated_at: new Date()
      });

      await newSession.save({ validateBeforeSave: false });  
      session = newSession.toObject();

      console.log(' New draft created:', session.title);
    }

    return NextResponse.json({
      success: true,
      message: body.id ? 'Draft updated successfully' : 'Draft saved successfully',
      session: {
        ...session,
        id: session._id.toString(),
        _id: session._id.toString(),
        user_id: session.user_id.toString(),
        autoSaved: true,
        lastSaved: new Date().toISOString()
      },
      autoSave: true
    });

  } catch (error) {
    console.error('Save Draft Error:', error);
    
    
    return NextResponse.json({
      success: false,
      error: 'Failed to save draft',
      autoSaveError: true,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}