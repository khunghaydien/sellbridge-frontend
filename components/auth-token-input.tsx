"use client";

import { useState, useEffect } from 'react';

interface AuthTokenInputProps {
  onTokenSet: (token: string) => void;
}

export function AuthTokenInput({ onTokenSet }: AuthTokenInputProps) {
  const [token, setToken] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Load token from localStorage
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setToken(savedToken);
      onTokenSet(savedToken);
    }
  }, [onTokenSet]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      localStorage.setItem('authToken', token.trim());
      onTokenSet(token.trim());
      setIsVisible(false);
    }
  };

  const handleClear = () => {
    localStorage.removeItem('authToken');
    setToken('');
    onTokenSet('');
  };

  if (!isVisible && token) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Token: {token.substring(0, 10)}...
        </span>
        <button
          onClick={() => setIsVisible(true)}
          className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Change
        </button>
        <button
          onClick={handleClear}
          className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Clear
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="password"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Enter auth token..."
        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
        autoFocus
      />
      <button
        type="submit"
        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
      >
        Set
      </button>
      {token && (
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded"
        >
          Cancel
        </button>
      )}
    </form>
  );
}
