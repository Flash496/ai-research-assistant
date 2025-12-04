import axios from 'axios';
import { env } from '../../config/environment';

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  snippet?: string;
  score?: number;
}

export class SearchTool {
  private apiUrl = 'https://api.tavily.com/search';
  private apiKey = env.TAVILY_API_KEY;

  async search(query: string, maxResults: number = 5): Promise<SearchResult[]> {
    try {
      const response = await axios.post(this.apiUrl, {
        api_key: this.apiKey,
        query,
        max_results: maxResults,
        search_depth: 'advanced',
        include_domains: [],
        exclude_domains: [],
      });

      return response.data.results.map((result: any) => ({
        title: result.title,
        url: result.url,
        content: result.content,
        snippet: result.snippet,
        score: result.score,
      }));
    } catch (error) {
      console.error('Search error:', error);
      throw new Error(`Failed to search: ${error.message}`);
    }
  }

  async searchMultiple(queries: string[], maxResults: number = 3): Promise<SearchResult[]> {
    const allResults = await Promise.all(
      queries.map(q => this.search(q, maxResults))
    );
    
    // Flatten and deduplicate by URL
    const uniqueByUrl = new Map<string, SearchResult>();
    for (const results of allResults) {
      for (const result of results) {
        if (!uniqueByUrl.has(result.url)) {
          uniqueByUrl.set(result.url, result);
        }
      }
    }
    
    return Array.from(uniqueByUrl.values());
  }
}