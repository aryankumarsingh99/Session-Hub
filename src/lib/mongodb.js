// src/lib/mongodb.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/session-hub';

let cached = global.mongodb;

if (!cached) {
  cached = global.mongodb = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    console.log('🔄 MongoDB: Using existing connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    console.log('🔄 MongoDB: Creating new connection...');
    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log('✅ MongoDB: Connected successfully');
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB: Connection failed', e);
    throw e;
  }
}

export default dbConnect;