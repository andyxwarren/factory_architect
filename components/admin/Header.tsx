'use client';

import { Database } from 'lucide-react';

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-2">
        <Database className="h-5 w-5 text-green-600" />
        <span className="text-sm font-medium text-green-600">Connected to Supabase</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">Admin User</p>
          <p className="text-xs text-gray-500">Development Mode</p>
        </div>
      </div>
    </header>
  );
}
