'use client';

import type { Session } from 'next-auth';

interface AgentGalleryPageProps {
  session: Session;
}

export default function AgentGalleryPage({ session }: AgentGalleryPageProps) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Agent Gallery</h1>
      <div className="mb-4">
        <p>Welcome, {session.user?.name || session.user?.email}!</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Placeholder for agent gallery content */}
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold">Agent Placeholder</h2>
          <p className="text-gray-600">Gallery content will be added here</p>
        </div>
      </div>
    </div>
  );
}