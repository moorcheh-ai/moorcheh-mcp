import { z } from 'zod';
import { makeApiRequest, API_ENDPOINTS } from '../config/api.js';

// Search tool
export const searchTool = {
  name: "search",
  description: "Search across namespaces with vector similarity in Moorcheh",
  parameters: {
    namespaces: z.array(z.string()).describe("Array of namespace names to search in"),
    query: z.union([z.string(), z.array(z.number())]).describe("Search query - can be text string or vector array of numbers eg [1,2,3] DO NOT USE QUOTES"),
    top_k: z.number().optional().describe("Number of top results to return (default: 10)"),
    threshold: z.number().min(0).max(1).optional().describe("Similarity threshold for results (0-1)"),
    kiosk_mode: z.boolean().optional().describe("Enable kiosk mode for public access"),
  },
  handler: async ({ namespaces, query, top_k = 10, threshold, kiosk_mode = false }) => {
    try {
      // --- NEW LOGIC: Fetch namespace info and parse query if needed ---
      let finalQuery = query;
      if (namespaces && namespaces.length > 0 && typeof query === 'string') {
        // Fetch all namespaces and find the specific one
        const allNamespacesResp = await makeApiRequest('GET', API_ENDPOINTS.namespaces);
        const allNamespaces = allNamespacesResp.namespaces || [];
        
        // Find the specific namespace from the list
        const targetNamespace = allNamespaces.find(ns => ns.namespace_name === namespaces[0]);
        
        if (targetNamespace && targetNamespace.type === 'vector') {
          // Try to parse the string into an array of numbers
          const arr = query.split(',').map(s => parseFloat(s.trim())).filter(v => !isNaN(v));
          if (!arr.length || arr.length !== (targetNamespace.vector_dimension || arr.length)) {
            return {
              content: [
                {
                  type: "text",
                  text: `Error: Query string could not be parsed into a valid ${targetNamespace.vector_dimension || ''}-dimensional vector array. Please provide a comma-separated list of numbers matching the namespace dimension.`,
                },
              ],
            };
          }
          finalQuery = arr;
        }
      }
      // --- END NEW LOGIC ---
      const requestBody = {
        namespaces,
        query: finalQuery,
        top_k,
        kiosk_mode,
      };
      if (threshold !== undefined) {
        requestBody.threshold = threshold;
      }
      const data = await makeApiRequest('POST', API_ENDPOINTS.search, requestBody);
      if (!data.results || data.results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No results found for query: "${query}"`,
            },
          ],
        };
      }
      const formattedResults = data.results.map((result, index) =>
        [
          `Result ${index + 1}:`,
          `Content: ${result.content}`,
          `Score: ${result.score || 'N/A'}`,
          `Metadata: ${JSON.stringify(result.metadata || {}, null, 2)}`,
          "---",
        ].join("\n")
      );
      const searchText = `Search results for "${query}" in namespaces [${namespaces.join(', ')}]:\n\n${formattedResults.join("\n")}\n\nTotal results: ${data.total || data.results.length}`;
      return {
        content: [
          {
            type: "text",
            text: searchText,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error searching: ${error.message}`,
          },
        ],
      };
    }
  },
};

// Answer tool
export const answerTool = {
  name: "answer",
  description: "Get AI-generated answers based on data in a namespace using Moorcheh",
  parameters: {
    namespace: z.string().describe("Name of the namespace to search in"),
    query: z.string().describe("Question or query to get an answer for"),
    top_k: z.number().optional().describe("Number of top results to use for context (default: 5)"),
    threshold: z.number().min(0).max(1).optional().describe("Similarity threshold for results (0-1)"),
    type: z.enum(['text', 'vector']).optional().describe("Type of search to perform (default: text)"),
    kiosk_mode: z.boolean().optional().describe("Enable kiosk mode for public access"),
    aiModel: z.string().optional().describe("AI model to use for generating answers"),
    chatHistory: z.array(z.object({
      role: z.string(),
      content: z.string()
    })).optional().describe("Previous chat messages for context"),
    headerPrompt: z.string().optional().describe("Custom header prompt for the AI"),
    footerPrompt: z.string().optional().describe("Custom footer prompt for the AI"),
    temperature: z.number().min(0).max(2.0).optional().describe("Temperature for AI response generation (0-2, default: 0.7)"),
  },
  handler: async ({ namespace, query, top_k = 5, threshold, type = 'text', kiosk_mode = false, aiModel, chatHistory = [], headerPrompt, footerPrompt, temperature = 0.7 }) => {
    try {
      const requestBody = {
        namespace,
        query,
        top_k,
        type,
        kiosk_mode,
        temperature,
      };
      
      if (threshold !== undefined) {
        requestBody.threshold = threshold;
      }
      if (aiModel) {
        requestBody.aiModel = aiModel;
      }
      if (chatHistory && chatHistory.length > 0) {
        requestBody.chatHistory = chatHistory;
      }
      if (headerPrompt) {
        requestBody.headerPrompt = headerPrompt;
      }
      if (footerPrompt) {
        requestBody.footerPrompt = footerPrompt;
      }

      const data = await makeApiRequest('POST', API_ENDPOINTS.answer, requestBody);

      const resultText = `AI Answer for "${query}" in namespace "${namespace}":\n\n${data.answer || data.response || JSON.stringify(data, null, 2)}`;

      return {
        content: [
          {
            type: "text",
            text: resultText,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting AI answer: ${error.message}`,
          },
        ],
      };
    }
  },
}; 