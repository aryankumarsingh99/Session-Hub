// src/app/my-sessions/page.js
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function MySessionsContent() {
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchMySessions();
  }, [statusFilter]);

  const fetchMySessions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/my-sessions?status=${statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setSessions(data.sessions);
      } else {
        console.error('Failed to fetch sessions:', data.error);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const publishSession = async (sessionId) => {
    try {
      setActionLoading(sessionId);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/my-sessions/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update session in state
        setSessions(prev => prev.map(session => 
          session._id === sessionId 
            ? { ...session, status: 'published', published_at: new Date().toISOString() }
            : session
        ));
        console.log('✅ Session published successfully');
      } else {
        console.error('Failed to publish session:', data.error);
        alert('Failed to publish session: ' + data.error);
      }
    } catch (error) {
      console.error('Error publishing session:', error);
      alert('Error publishing session. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteSession = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(sessionId);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/my-sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setSessions(prev => prev.filter(session => session._id !== sessionId));
        console.log('✅ Session deleted successfully');
      } else {
        console.error('Failed to delete session:', data.error);
        alert('Failed to delete session: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Error deleting session. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStats = () => {
    const drafts = sessions.filter(s => s.status === 'draft').length;
    const published = sessions.filter(s => s.status === 'published').length;
    const totalViews = sessions.reduce((sum, s) => sum + (s.views || 0), 0);
    
    return { total: sessions.length, drafts, published, views: totalViews };
  };

  const stats = getStats();

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Sessions</h1>
            <p className="text-gray-600">Manage your wellness sessions and drafts</p>
          </div>
          <Link
            href="/sessions/create"
            className="mt-4 lg:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Session
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Sessions" value={stats.total} icon="📚" color="blue" />
          <StatsCard title="Published" value={stats.published} icon="✅" color="green" />
          <StatsCard title="Drafts" value={stats.drafts} icon="📝" color="yellow" />
          <StatsCard title="Total Views" value={stats.views.toLocaleString()} icon="👁️" color="purple" />
        </div>

        {/* Sessions List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Your Sessions ({filteredSessions.length})
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-80">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search your sessions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-black pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Sessions</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sessions Grid */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredSessions.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredSessions.map((session) => (
                  <MySessionCard 
                    key={session._id} 
                    session={session} 
                    onPublish={publishSession}
                    onDelete={deleteSession}
                    actionLoading={actionLoading}
                  />
                ))}
              </div>
            ) : (
              <EmptyMySessionsState searchTerm={searchTerm} statusFilter={statusFilter} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorClasses[color]} mr-4`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// My Session Card Component
function MySessionCard({ session, onPublish, onDelete, actionLoading }) {
  const router = useRouter();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
              {session.title}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              session.status === 'published' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {session.status === 'published' ? 'Published' : 'Draft'}
            </span>
          </div>
          
          {session.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {session.description}
            </p>
          )}
        </div>
      </div>

      {/* Tags */}
      {session.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {session.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
              {tag}
            </span>
          ))}
          {session.tags.length > 3 && (
            <span className="text-gray-500 text-xs">+{session.tags.length - 3} more</span>
          )}
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div>
          Created: {formatDate(session.created_at)}
        </div>
        {session.status === 'published' && (
          <div className="flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {session.views || 0} views
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push(`/sessions/edit/${session._id}`)}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>

        {session.status === 'draft' && (
          <button
            onClick={() => onPublish(session._id)}
            disabled={actionLoading === session._id}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center"
          >
            {actionLoading === session._id ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                Publishing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Publish
              </>
            )}
          </button>
        )}

        <button
          onClick={() => onDelete(session._id)}
          disabled={actionLoading === session._id}
          className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center"
        >
          {actionLoading === session._id ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyMySessionsState({ searchTerm, statusFilter }) {
  return (
    <div className="text-center py-12">
      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {searchTerm ? 'No sessions found' : `No ${statusFilter === 'all' ? '' : statusFilter} sessions yet`}
      </h3>
      <p className="text-gray-500 mb-4">
        {searchTerm 
          ? 'Try adjusting your search terms or filters.'
          : 'Create your first wellness session to get started!'
        }
      </p>
      {!searchTerm && (
        <Link
          href="/sessions/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Your First Session
        </Link>
      )}
    </div>
  );
}

export default function MySessions() {
  return (
    <ProtectedRoute>
      <MySessionsContent />
    </ProtectedRoute>
  );
}