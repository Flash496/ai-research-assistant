import { SearchTool } from './src/agent/tools/search.tool';

async function test() {
  const tool = new SearchTool();
  const results = await tool.search('AI agents 2025');
  console.log(results);
}

test();