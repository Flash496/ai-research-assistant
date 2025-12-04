import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ResearchResponse {
  id: string;
  query: string;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  progress: number;
  report?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export const researchApi = {
  async startResearch(query: string): Promise<ResearchResponse> {
    const response = await apiClient.post('/api/research/start', { query });
    return response.data;
  },

  async getResearch(id: string): Promise<ResearchResponse> {
    const response = await apiClient.get(`/api/research/${id}`);
    return response.data;
  },

  async getStatus(id: string): Promise<{ status: string; progress: number }> {
    const response = await apiClient.get(`/api/research/${id}/status`);
    return response.data;
  },
};