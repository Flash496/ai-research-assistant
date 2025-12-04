export interface SearchResult {
  title: string;
  url: string;
  content: string;
  snippet?: string;
  score?: number;
}

export interface Finding {
  title: string;
  content: string;
  sources: string[];
}

export interface ResearchState {
  query: string;
  plan: string;
  searchQueries: string[];
  searchResults: SearchResult[];
  analysis: string;
  findings: Finding[];
  report: string;
  metadata: {
    startTime: number;
    endTime?: number;
    stepsCompleted: string[];
  };
}