import { Injectable, Logger } from '@nestjs/common';
import { ChatGroq } from '@langchain/groq';
import { env } from '../config/environment';
import { SearchTool } from './tools/search.tool';
import { ResearchState, Finding } from './state';

@Injectable()
export class AgentService {
  private llm: ChatGroq;
  private searchTool: SearchTool;
  private logger = new Logger('AgentService');

  constructor() {
    this.llm = new ChatGroq({
      model: 'llama-3.3-70b-versatile',
      apiKey: env.GROQ_API_KEY,
      temperature: 0.7,
      maxTokens: 2048,
    });
    this.searchTool = new SearchTool();
  }

  async executeResearch(query: string, onProgress?: (step: string) => void): Promise<ResearchState> {
    const state: ResearchState = {
      query,
      plan: '',
      searchQueries: [],
      searchResults: [],
      analysis: '',
      findings: [],
      report: '',
      metadata: {
        startTime: Date.now(),
        stepsCompleted: [],
      },
    };

    try {
      // Step 1: Plan
      onProgress?.('planning');
      state.plan = await this.planResearch(query);
      state.searchQueries = this.extractSearchQueries(state.plan);
      state.metadata.stepsCompleted.push('plan');
      this.logger.log(`Plan: ${state.plan}`);

      // Step 2: Search
      onProgress?.('searching');
      state.searchResults = await this.searchTool.searchMultiple(state.searchQueries, 3);
      state.metadata.stepsCompleted.push('search');
      this.logger.log(`Found ${state.searchResults.length} sources`);

      // Step 3: Analyze
      onProgress?.('analyzing');
      state.analysis = await this.analyzeResults(state.query, state.searchResults);
      state.findings = this.extractFindings(state.analysis, state.searchResults);
      state.metadata.stepsCompleted.push('analyze');
      this.logger.log(`Extracted ${state.findings.length} key findings`);

      // Step 4: Generate Report
      onProgress?.('generating');
      state.report = this.generateReport(state);
      state.metadata.stepsCompleted.push('generate');
      this.logger.log('Report generated');

      state.metadata.endTime = Date.now();
      return state;
    } catch (error) {
      this.logger.error(`Research failed: ${error.message}`);
      throw error;
    }
  }

  private async planResearch(query: string): Promise<string> {
    const prompt = `You are a research strategist. For the following query, create a brief research plan with 3-5 search queries.

Query: ${query}

Respond with:
1. Brief analysis of what we need to find
2. List of specific search queries (one per line, starting with -)

Be concise and strategic.`;

    const response = await this.llm.invoke(prompt);
    return response.content as string;
  }

  private extractSearchQueries(plan: string): string[] {
    // Extract lines starting with "-" as search queries
    const lines = plan.split('\n');
    return lines
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(q => q.length > 0);
  }

  private async analyzeResults(query: string, results: any[]): Promise<string> {
    const content = results.map(r => `Title: ${r.title}\nContent: ${r.content}`).join('\n\n');

    const prompt = `Analyze the following search results for the query: "${query}"

Results:
${content}

Provide a comprehensive analysis including:
1. Main themes and patterns
2. Key insights
3. Notable findings
4. Any gaps or limitations

Be thorough but concise.`;

    const response = await this.llm.invoke(prompt);
    return response.content as string;
  }

  private extractFindings(analysis: string, sources: any[]): Finding[] {
    // Simple extraction - in production, you'd use more sophisticated parsing
    const findings: Finding[] = [];
    
    const sections = analysis.split('\n\n');
    for (const section of sections.slice(0, 5)) {
      if (section.trim().length > 50) {
        findings.push({
          title: section.split('\n')[0].replace(/^\d+\.\s*/, '').substring(0, 100),
          content: section.substring(0, 300),
          sources: sources.map(s => s.url).slice(0, 2),
        });
      }
    }
    
    return findings;
  }

  private generateReport(state: ResearchState): string {
    const metadata = `
Report Generated: ${new Date().toISOString()}
Query: ${state.query}
Sources Analyzed: ${state.searchResults.length}
Key Findings: ${state.findings.length}
Duration: ${((state.metadata.endTime || Date.now()) - state.metadata.startTime) / 1000}s
`;

    const findings = state.findings
      .map((f, i) => `### ${i + 1}. ${f.title}\n\n${f.content}`)
      .join('\n\n');

    const sources = state.searchResults
      .map((s, i) => `[${i + 1}] [${s.title}](${s.url})`)
      .join('\n');

    return `# Research Report: ${state.query}

## Executive Summary
${state.analysis.split('\n\n')[0]}

## Key Findings
${findings}

## Methodology
${metadata}

## Sources
${sources}`;
  }
}