// src/app/sessions/edit/[id]/page.js
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

function SessionEditContent() {
  const params = useParams();
  return <SessionEditor mode="edit" sessionId={params.id} />;
}

export default function SessionEdit() {
  return (
    <ProtectedRoute>
      <SessionEditContent />
    </ProtectedRoute>
  );
}

// Import the SessionEditor component from create page
// We can either move it to a separate component file or duplicate it here
// For now, let's create a separate component file

// src/components/sessions/SessionEditor.js
function SessionEditor({ mode = 'create', sessionId = null }) {
  // ... (same code as in the create page)
  // This is the same SessionEditor component we created above
}