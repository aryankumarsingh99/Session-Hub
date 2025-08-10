'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';

function ViewSessionContent() {
  const { id } = useParams();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSession();
    }
  }, [id]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to view sessions');
        setLoading(false);
        return;
      }

      console.log('🔍 Fetching session:', id);
      
      const response = await fetch(`/api/my-sessions/${id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setSession(data.session);
      } else {
        setError(data.error || 'Failed to load session');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/sessions/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/my-sessions/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        alert('Session deleted successfully');
        router.push('/my-sessions');
      } else {
        alert(data.error || 'Failed to delete session');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Error deleting session. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async () => {
    if (session.status === 'published') {
      alert('Session is already published');
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/my-sessions/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: session._id,
          title: session.title,
          description: session.description,
          tags: session.tags,
          json_file_url: session.json_file_url,
          category: session.category,
          difficulty: session.difficulty,
          duration: session.duration
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Session published successfully!');
        setSession(prev => ({ ...prev, status: 'published', published_at: new Date().toISOString() }));
      } else {
        alert(data.error || 'Failed to publish session');
      }
    } catch (error) {
      console.error('Error publishing session:', error);
      alert('Error publishing session. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
                  SessionHub
                </Link>
              </div>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
                  SessionHub
                </Link>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => router.push('/my-sessions')}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Back to My Sessions
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
                  SessionHub
                </Link>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">Session not found</h2>
            <p className="text-gray-600 mt-2 mb-4">The session you're looking for doesn't exist or you don't have access to it.</p>
            <button 
              onClick={() => router.push('/my-sessions')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Back to My Sessions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
                SessionHub
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 pb-1 px-1 text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/my-sessions" className="text-blue-600 border-b-2 border-blue-600 pb-1 px-1 text-sm font-medium">
                My Sessions
              </Link>
              <Link href="/sessions/create" className="text-gray-500 hover:text-gray-700 pb-1 px-1 text-sm font-medium">
                Create Session
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
              </div>

              <button
                onClick={logout}
                className="flex items-center text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Session Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-3">{session.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-blue-100">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    session.status === 'published' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-yellow-500 text-yellow-900'
                  }`}>
                    {session.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                  <span className="capitalize">{session.category || 'General'}</span>
                  <span className="capitalize">{session.difficulty || 'Beginner'}</span>
                  {session.duration && <span>{session.duration} min</span>}
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <button
                  onClick={handleEdit}
                  disabled={actionLoading}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded text-white transition-colors disabled:opacity-50 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                
                {session.status === 'draft' && (
                  <button
                    onClick={handlePublish}
                    disabled={actionLoading}
                    className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white transition-colors disabled:opacity-50 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Publish
                  </button>
                )}
                
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white transition-colors disabled:opacity-50 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Session Content */}
          <div className="p-6">
            {/* Description */}
            {session.description && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Description</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{session.description}</p>
              </div>
            )}

            {/* Tags */}
            {session.tags && session.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {session.tags.map((tag, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* JSON File URL */}
            {session.json_file_url && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Session Configuration</h3>
                <div className="bg-gray-50 border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-gray-600">JSON Configuration File</span>
                    </div>
                    <a 
                      href={session.json_file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <span>View File</span>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 break-all">{session.json_file_url}</div>
                </div>
              </div>
            )}

            {/* Session Stats */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Session Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{session.views || 0}</p>
                  <p className="text-sm text-blue-600 font-medium">Views</p>
                </div>
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{session.likes || 0}</p>
                  <p className="text-sm text-green-600 font-medium">Likes</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600 capitalize">{session.status}</p>
                  <p className="text-sm text-purple-600 font-medium">Status</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-yellow-600 capitalize">{session.category || 'General'}</p>
                  <p className="text-sm text-yellow-600 font-medium">Category</p>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-medium text-gray-600 w-20">Created:</span>
                  <span className="text-gray-900">{formatDate(session.created_at)}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="font-medium text-gray-600 w-20">Updated:</span>
                  <span className="text-gray-900">{formatDate(session.updated_at)}</span>
                </div>
                
                {session.published_at && (
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium text-gray-600 w-20">Published:</span>
                    <span className="text-gray-900">{formatDate(session.published_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t pt-6 mt-6">
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/my-sessions"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to My Sessions
                </Link>
                
                <Link
                  href="/sessions/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Session
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ViewSession() {
  return (
    <ProtectedRoute>
      <ViewSessionContent />
    </ProtectedRoute>
  );
}