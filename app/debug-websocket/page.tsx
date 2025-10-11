"use client";

import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthContext } from '@/providers';

export default function DebugWebSocketPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Not Connected');
  const [logs, setLogs] = useState<string[]>([]);
  const [testMessage, setTestMessage] = useState('');
  const [receivedMessages, setReceivedMessages] = useState<any[]>([]);
  const { isAuthenticated, user } = useAuthContext();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
  };

  const connect = useCallback(() => {
    addLog('🔄 Attempting to connect...');
    
    const SOCKET_URL = 'https://sellbridge-backend-production.up.railway.app';
    addLog(`📍 Connecting to: ${SOCKET_URL}`);
    
    // Use cookie-based authentication (no manual token needed)
    addLog('🍪 Using cookie-based authentication');
    
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      withCredentials: true, // Send cookies for authentication
    });

    newSocket.on('connect', () => {
      addLog('✅ Connected successfully!');
      addLog(`🆔 Socket ID: ${newSocket.id}`);
      setConnectionStatus('Connected');
      
      // Send user info to backend (if available)
      if (user?.id) {
        addLog('👤 Sending user info to backend...');
        newSocket.emit('authenticate', { userId: user.id, userName: user.name });
      } else {
        addLog('👤 No user info available, connecting anonymously...');
      }
      
      // Join all pages to receive messages from all pages
      addLog('🌐 Joining all pages to receive messages...');
      newSocket.emit('joinAllPages');
      
      // Test if we can receive events
      addLog('🧪 Testing event reception...');
    });

    newSocket.on('disconnect', (reason) => {
      addLog(`❌ Disconnected: ${reason}`);
      setConnectionStatus('Disconnected');
    });

    newSocket.on('connect_error', (error) => {
      addLog(`🚫 Connection Error: ${error.message}`);
      addLog(`🔍 Error Type: ${error}`);
      setConnectionStatus('Connection Error');
    });

    // Listen for Facebook messages
    newSocket.on('new_message', (data) => {
      addLog('📨 Received new Facebook message!');
      addLog(`📦 Message data: ${JSON.stringify(data, null, 2)}`);
      setReceivedMessages(prev => [data, ...prev]);
    });

    // Listen for webhook test messages
    newSocket.on('webhook_test', (data) => {
      addLog('🧪 Received webhook_test event');
      addLog(`📦 Test data: ${JSON.stringify(data, null, 2)}`);
      setReceivedMessages(prev => [data, ...prev]);
    });

    // Listen for page changes
    newSocket.on('page_change', (data) => {
      addLog('🔄 Received page_change event');
      addLog(`📦 Change data: ${JSON.stringify(data, null, 2)}`);
      setReceivedMessages(prev => [data, ...prev]);
    });

    // Listen for system events
    newSocket.on('auth_success', (data) => {
      addLog('✅ Authentication successful!');
      addLog(`📦 Auth data: ${JSON.stringify(data, null, 2)}`);
    });

    newSocket.on('joined_all_pages', (data) => {
      addLog('🌐 Successfully joined all pages!');
      addLog(`📦 Join data: ${JSON.stringify(data, null, 2)}`);
    });

    newSocket.on('connected', (data) => {
      addLog('🔗 Connection confirmed!');
      addLog(`📦 Connection data: ${JSON.stringify(data, null, 2)}`);
    });


    setSocket(newSocket);
  }, [user?.id]);

  const disconnect = useCallback(() => {
    if (socket) {
      addLog('🔌 Disconnecting...');
      socket.disconnect();
      setSocket(null);
      setConnectionStatus('Disconnected');
    }
  }, [socket]);

  const sendTestMessage = () => {
    if (socket && testMessage) {
      addLog(`📤 Sending test message: ${testMessage}`);
      socket.emit('test', { message: testMessage, timestamp: Date.now() });
      setTestMessage('');
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setReceivedMessages([]);
  };

  useEffect(() => {
    // Auto-connect when component mounts
    addLog('🔄 Auto-connecting on page load...');
    connect();

    return () => {
      // Auto-disconnect when leaving the page
      if (socket) {
        addLog('🔌 Auto-disconnecting on page leave...');
        socket.disconnect();
        setSocket(null);
        setConnectionStatus('Disconnected');
      }
    };
  }, []); // Empty dependency array - only run once on mount

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            🔧 WebSocket Debug Tool
          </h1>
          
          {/* Connection Status */}
          <div className="flex items-center gap-4 mb-6">
            <div className={`px-4 py-2 rounded-lg font-semibold ${
              connectionStatus === 'Connected' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : connectionStatus === 'Connection Error'
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              Status: {connectionStatus}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              URL: https://sellbridge-backend-production.up.railway.app
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="mb-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="px-3 py-1 rounded-lg text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  👤 User: {user.name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  ID: {user.id}
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Clear Logs
            </button>
          </div>

          {/* Test Message */}
          <div className="flex gap-3">
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Test message to send..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <button
              onClick={sendTestMessage}
              disabled={!socket || !testMessage}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              Send Test
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Logs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              📋 Connection Logs
            </h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Received Messages */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              📨 Received Messages ({receivedMessages.length})
            </h2>
            <div className="space-y-3 h-96 overflow-y-auto">
              {receivedMessages.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  No messages received yet...
                </div>
              ) : (
                receivedMessages.map((msg, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                          Type: {msg.type || 'unknown'}
                        </span>
                        {msg.timestamp && (
                          <span className="text-xs text-gray-500">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                      {msg.pageId && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Page ID: {msg.pageId}
                        </div>
                      )}
                      {msg.senderId && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Sender: {msg.senderId}
                        </div>
                      )}
                      {msg.text && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Text: {msg.text}
                        </div>
                      )}
                    </div>
                    <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      {JSON.stringify(msg, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
