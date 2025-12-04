import { useEffect, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

export interface ProgressUpdate {
  step: string;
  message: string;
  timestamp: string;
}

interface ResearchTask {
  id: string;
  query: string;
  status: string;
  progress: number;
  report?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export function useWebSocket(taskId?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) return;

    const newSocket = io(WS_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      newSocket.emit('subscribe', { taskId });
    });

    newSocket.on('progress', (data: ProgressUpdate) => {
      setProgress(data);
    });

    newSocket.on('complete', (data: { report: string }) => {
      setReport(data.report);
    });

    newSocket.on('error', (data: { error: string }) => {
      setError(data.error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [taskId]);

  return { socket, progress, report, error };
}

export function useResearch(taskId?: string) {
  const [task, setTask] =  useState<ResearchTask | null>(null);
  const [loading, setLoading] = useState(false);
  const { progress, report, error: wsError } = useWebSocket(taskId);

  useEffect(() => {
    if (!taskId) return;

    const pollStatus = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/research/${taskId}`);
        const data = await response.json();
        setTask(data);
      } catch (err) {
        console.error('Failed to fetch status:', err);
      } finally {
        setLoading(false);
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 2000);

    return () => clearInterval(interval);
  }, [taskId]);

  return {
    task,
    loading,
    progress,
    report,
    error: wsError,
  };
}