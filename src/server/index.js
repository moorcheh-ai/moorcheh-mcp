#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Import tools
import { listNamespacesTool, createNamespaceTool, deleteNamespaceTool } from './tools/namespace-tools.js';
import { uploadTextTool, uploadVectorsTool, deleteDataTool } from './tools/data-tools.js';
import { searchTool, answerTool } from './tools/search-tools.js';

// Import resources
import {
  namespacesResource,
  namespaceDetailsResource,
  apiDocsResource,
  configHelpResource,
  namespaceCreationGuideResource,
  searchOptimizationGuideResource,
  dataOrganizationGuideResource,
  aiAnswerSetupGuideResource
} from './utils/resources.js';

// Import prompts
import {
  searchOptimizationPrompt,
  dataOrganizationPrompt,
  aiAnswerSetupPrompt
} from './utils/prompts.js';

// Suppress stdout to prevent any non-MCP output
const originalStdoutWrite = process.stdout.write;
process.stdout.write = (chunk, encoding, callback) => {
  // Only allow JSON-RPC messages to stdout
  if (typeof chunk === 'string' && (chunk.trim().startsWith('{') || chunk.trim().startsWith('['))) {
    return originalStdoutWrite.call(process.stdout, chunk, encoding, callback);
  }
  // Redirect everything else to stderr
  process.stderr.write(chunk, encoding, callback);
};

// Create server instance
const server = new McpServer({
  name: "Moorcheh",
  version: "1.0.0",
});

// ========== REGISTER RESOURCES ==========

// Register all resources
server.resource(
  namespacesResource.uri,
  namespacesResource.description,
  namespacesResource.mimeType,
  namespacesResource.handler
);

server.resource(
  namespaceDetailsResource.uri,
  namespaceDetailsResource.description,
  namespaceDetailsResource.mimeType,
  namespaceDetailsResource.handler
);

server.resource(
  apiDocsResource.uri,
  apiDocsResource.description,
  apiDocsResource.mimeType,
  apiDocsResource.handler
);

server.resource(
  configHelpResource.uri,
  configHelpResource.description,
  configHelpResource.mimeType,
  configHelpResource.handler
);

server.resource(
  namespaceCreationGuideResource.uri,
  namespaceCreationGuideResource.description,
  namespaceCreationGuideResource.mimeType,
  namespaceCreationGuideResource.handler
);

server.resource(
  searchOptimizationGuideResource.uri,
  searchOptimizationGuideResource.description,
  searchOptimizationGuideResource.mimeType,
  searchOptimizationGuideResource.handler
);

server.resource(
  dataOrganizationGuideResource.uri,
  dataOrganizationGuideResource.description,
  dataOrganizationGuideResource.mimeType,
  dataOrganizationGuideResource.handler
);

server.resource(
  aiAnswerSetupGuideResource.uri,
  aiAnswerSetupGuideResource.description,
  aiAnswerSetupGuideResource.mimeType,
  aiAnswerSetupGuideResource.handler
);

// ========== REGISTER TOOLS ==========

// Register namespace tools
server.tool(
  listNamespacesTool.name,
  listNamespacesTool.description,
  listNamespacesTool.parameters,
  listNamespacesTool.handler,
);

server.tool(
  createNamespaceTool.name,
  createNamespaceTool.description,
  createNamespaceTool.parameters,
  createNamespaceTool.handler,
);

server.tool(
  deleteNamespaceTool.name,
  deleteNamespaceTool.description,
  deleteNamespaceTool.parameters,
  deleteNamespaceTool.handler,
);

// Register data tools
server.tool(
  uploadTextTool.name,
  uploadTextTool.description,
  uploadTextTool.parameters,
  uploadTextTool.handler,
);

server.tool(
  uploadVectorsTool.name,
  uploadVectorsTool.description,
  uploadVectorsTool.parameters,
  uploadVectorsTool.handler,
);

server.tool(
  deleteDataTool.name,
  deleteDataTool.description,
  deleteDataTool.parameters,
  deleteDataTool.handler,
);

// Register search tools
server.tool(
  searchTool.name,
  searchTool.description,
  searchTool.parameters,
  searchTool.handler,
);

server.tool(
  answerTool.name,
  answerTool.description,
  answerTool.parameters,
  answerTool.handler,
);

// ========== REGISTER PROMPTS ==========

// Register search optimization prompt
server.registerPrompt(
  searchOptimizationPrompt.name,
  searchOptimizationPrompt.description,
  searchOptimizationPrompt.arguments,
  searchOptimizationPrompt.handler
);

// Register data organization prompt
server.registerPrompt(
  dataOrganizationPrompt.name,
  dataOrganizationPrompt.description,
  dataOrganizationPrompt.arguments,
  dataOrganizationPrompt.handler
);

// Register AI answer setup prompt
server.registerPrompt(
  aiAnswerSetupPrompt.name,
  aiAnswerSetupPrompt.description,
  aiAnswerSetupPrompt.arguments,
  aiAnswerSetupPrompt.handler
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Server started");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
}); 