 
'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function SessionCreateContent() {
  return <SessionEditor mode="create" />;
}

export default function SessionCreate() {
  return (
    <ProtectedRoute>
      <SessionCreateContent />
    </ProtectedRoute>
  );
}

 
function SessionEditor({ mode = 'create', sessionId = null }) {
  const { user, logout } = useAuth();
  const [sessionData, setSessionData] = useState({
    title: '',
    description: '',
    tags: [],
    json_file_url: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const router = useRouter();

 
  useEffect(() => {
    if (mode === 'edit' || (sessionData.title || sessionData.description)) {
      const timer = setTimeout(() => {
        autoSave();
      }, 5000);  

      return () => clearTimeout(timer);
    }
  }, [sessionData]);

 
  useEffect(() => {
    if (mode === 'edit' && sessionId) {
      loadSession();
    }
  }, [mode, sessionId]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/my-sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setSessionData(data.session);
      } else {
        console.error('Failed to load session:', data.error);
        router.push('/my-sessions');
      }
    } catch (error) {
      console.error('Error loading session:', error);
      router.push('/my-sessions');
    } finally {
      setLoading(false);
    }
  };

  const autoSave = async () => {
    if (!sessionData.title.trim() && !sessionData.description.trim()) return;
    
    try {
      setAutoSaveStatus('Saving...');
      const token = localStorage.getItem('token');
      const response = await fetch('/api/my-sessions/save-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...sessionData,
          sessionId: mode === 'edit' ? sessionId : undefined
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setLastSaved(new Date());
        setAutoSaveStatus('Saved');
        setTimeout(() => setAutoSaveStatus(''), 2000);
      } else {
        setAutoSaveStatus('Save failed');
        setTimeout(() => setAutoSaveStatus(''), 2000);
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      setAutoSaveStatus('Save failed');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!sessionData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!sessionData.json_file_url.trim()) {
      newErrors.json_file_url = 'JSON file URL is required';
    } else {
      try {
        new URL(sessionData.json_file_url);
      } catch {
        newErrors.json_file_url = 'Please enter a valid URL';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    if (!validateForm()) return;
    
    try {
      setSaveLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/my-sessions/save-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...sessionData,
          sessionId: mode === 'edit' ? sessionId : undefined
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setLastSaved(new Date());
 
        router.push('/my-sessions');
      } else {
        setErrors({ submit: data.error });
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setErrors({ submit: 'Failed to save draft. Please try again.' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) return;
    
    try {
      setPublishLoading(true);
      const token = localStorage.getItem('token');
      
   
      const saveResponse = await fetch('/api/my-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...sessionData,
          status: 'published',
          sessionId: mode === 'edit' ? sessionId : undefined
        })
      });

      const saveData = await saveResponse.json();
      
      if (saveData.success) {
        console.log(' Session published successfully');
        router.push('/my-sessions');
      } else {
        setErrors({ submit: saveData.error });
      }
    } catch (error) {
      console.error('Error publishing session:', error);
      setErrors({ submit: 'Failed to publish session. Please try again.' });
    } finally {
      setPublishLoading(false);
    }
  };

  
  const handleTagInput = (e) => {
    const value = e.target.value;
    setTagInput(value);
    
   
    if (value.includes(',')) {
      const newTags = value.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag);
      addMultipleTags(newTags);
      setTagInput('');
    }
  };

  const addMultipleTags = (newTags) => {
    const uniqueTags = newTags.filter(tag => 
      tag && !sessionData.tags.includes(tag) && sessionData.tags.length + newTags.indexOf(tag) < 10
    );
    
    if (uniqueTags.length > 0) {
      setSessionData(prev => ({
        ...prev,
        tags: [...prev.tags, ...uniqueTags.slice(0, 10 - prev.tags.length)]
      }));
    }
  };

  const handleTagAdd = () => {
    const input = tagInput.trim();
    if (!input) return;
    
  
    if (input.includes(',')) {
      const newTags = input.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag);
      addMultipleTags(newTags);
    } else {
      const newTag = input.toLowerCase();
      if (newTag && !sessionData.tags.includes(newTag) && sessionData.tags.length < 10) {
        setSessionData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
    }
    setTagInput('');
  };

  const handleTagRemove = (tagToRemove) => {
    setSessionData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleTagAdd();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
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
              <Link href="/my-sessions" className="text-gray-500 hover:text-gray-700 pb-1 px-1 text-sm font-medium">
                My Sessions
              </Link>
              <span className="text-blue-600 border-b-2 border-blue-600 pb-1 px-1 text-sm font-medium">
                {mode === 'create' ? 'Create Session' : 'Edit Session'}
              </span>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {mode === 'create' ? 'Create New Session' : 'Edit Session'}
            </h1>
            <p className="text-gray-600">
              {mode === 'create' 
                ? 'Create a new wellness session to share with the community.'
                : 'Make changes to your wellness session.'
              }
            </p>
          </div>
          
          {/* Auto-save Status */}
          {autoSaveStatus && (
            <div className={`flex items-center text-sm ${
              autoSaveStatus === 'Saved' ? 'text-green-600' : 
              autoSaveStatus === 'Saving...' ? 'text-blue-600' : 'text-red-600'
            }`}>
              {autoSaveStatus === 'Saving...' && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              )}
              {autoSaveStatus}
            </div>
          )}
        </div>

   
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <form className="space-y-6">
      
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {errors.submit}
                </div>
              </div>
            )}

       
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Session Title *
              </label>
              <input
                type="text"
                id="title"
                value={sessionData.title}
                onChange={(e) => setSessionData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full text-black px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter a compelling title for your wellness session"
                maxLength={200}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">{sessionData.title.length}/200 characters</p>
            </div>

           
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={sessionData.description}
                onChange={(e) => setSessionData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                placeholder="Provide a detailed description of your wellness session..."
                maxLength={1000}
              />
              <p className="mt-1 text-sm text-gray-500">{sessionData.description.length}/1000 characters</p>
            </div>

        
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags ({sessionData.tags.length}/10)
              </label>
              
        
              {sessionData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {sessionData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
                        title="Remove tag"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={handleTagInput}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Add tags separated by commas (e.g., meditation, relaxation, mindfulness)"
                  disabled={sessionData.tags.length >= 10}
                />
                <button
                  type="button"
                  onClick={handleTagAdd}
                  disabled={!tagInput.trim() || sessionData.tags.length >= 10}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Add
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                 <strong>Tip:</strong> Type tags separated by commas for quick entry (e.g., "meditation, relaxation, stress relief")
              </p>
            </div>

            {/* JSON File URL Field */}
            <div>
              <label htmlFor="json_file_url" className="block text-sm font-medium text-gray-700 mb-2">
                JSON File URL *
              </label>
              <input
                type="url"
                id="json_file_url"
                value={sessionData.json_file_url}
                onChange={(e) => setSessionData(prev => ({ ...prev, json_file_url: e.target.value }))}
                className={`w-full px-3 text-black py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.json_file_url ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="https://example.com/your-session-data.json"
              />
              {errors.json_file_url && (
                <p className="mt-1 text-sm text-red-600">{errors.json_file_url}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
               Provide a publicly accessible URL to your session's JSON configuration file
              </p>
            </div>

            {/* Last Saved Info */}
            {lastSaved && (
              <div className="text-sm text-gray-500 text-center py-2 bg-gray-50 rounded-lg border">
                💾 Last saved: {lastSaved.toLocaleString()}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <Link
                href="/my-sessions"
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors text-center"
              >
                Cancel
              </Link>
              
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={saveLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                {saveLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving Draft...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Save as Draft
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                {publishLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Publish Session
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}