import { z } from 'zod';
import { makeApiRequest, API_ENDPOINTS } from '../config/api.js';

// Search tool
export const searchTool = {
  name: "search",
  description: "Search for data in a namespace using semantic search or vector similarity. This tool provides powerful search capabilities across your namespaces, supporting both text-based semantic search and vector-based similarity search. For text search, you can use natural language queries to find relevant documents based on meaning rather than just keywords. For vector search, you can find similar content by comparing vector embeddings. The tool supports advanced features like result filtering, similarity thresholds, and kiosk mode for production environments. This is ideal for building intelligent search interfaces, recommendation systems, or content discovery features.",
  parameters: {
    namespaces: z.array(z.string().min(1)).min(1).describe("Namespaces to search in. Provide an array of namespace names where you want to search for content. You can search across multiple namespaces simultaneously. All namespaces must be accessible with your API key."),
    query: z.union([z.string().min(1), z.array(z.number())]).describe("Search query. For text search: provide a natural language query string (e.g., 'tell me about the company?', 'how to configure authentication?'). For vector search: provide an array of numbers representing a vector embedding (e.g., [0.1, 0.2, 0.3, ..., 0.768]). The query type will be automatically detected based on the input format. DO NOT USE QUOTES IN THE QUERY FOR VECTOR SEARCH."),
    query_type: z.enum(['text', 'vector']).optional().describe("Type of query to perform. 'text' for semantic search using natural language queries. 'vector' for similarity search using vector embeddings. If not specified, the type will be automatically detected based on the query format (string for text, array for vector)."),
    top_k: z.number().int().positive().optional().describe("Number of top results to return. Controls how many search results are returned, with higher values providing more comprehensive results. Default is 10. Use lower values (3-5) for focused results, higher values (10-20) for broader exploration."),
    threshold: z.number().min(0).max(1).optional().describe("Similarity threshold for results. A value between 0 and 1 that filters results based on similarity score. Higher values (0.7-0.9) return only highly similar results, lower values (0.3-0.5) return more comprehensive results. Required when kiosk_mode is true."),
    kiosk_mode: z.boolean().optional().describe("Kiosk mode for restricted search. When true, search is restricted to specific namespaces with threshold filtering, providing more controlled results suitable for production environments. When false, search across all specified namespaces without strict filtering."),
  },
  handler: async ({ namespaces, query, query_type, top_k = 10, threshold, kiosk_mode = false }) => {
    try {
      // Determine query type if not explicitly provided
      let finalQueryType = query_type;
      let finalQuery = query;
      
      if (!finalQueryType) {
        if (typeof query === 'string') {
          // Check if it's a string representation of a vector array
          if (query.startsWith('[') && query.endsWith(']')) {
            try {
              const parsedArray = JSON.parse(query);
              if (Array.isArray(parsedArray) && parsedArray.every(item => typeof item === 'number')) {
                finalQuery = parsedArray;
                finalQueryType = 'vector';
              } else {
                finalQueryType = 'text';
              }
            } catch (e) {
              finalQueryType = 'text';
            }
          } else {
            finalQueryType = 'text';
          }
        } else if (Array.isArray(query) && query.every(item => typeof item === 'number')) {
          finalQueryType = 'vector';
        } else {
          return {
            content: [
              {
                type: "text",
                text: 'Error: Unable to determine query type. Please specify query_type parameter or provide a valid string (for text) or number array (for vector).',
              },
            ],
          };
        }
      }

      // Handle vector query type with string input
      if (finalQueryType === 'vector' && typeof query === 'string') {
        try {
          const parsedArray = JSON.parse(query);
          if (Array.isArray(parsedArray) && parsedArray.every(item => typeof item === 'number')) {
            finalQuery = parsedArray;
          } else {
            return {
              content: [
                {
                  type: "text",
                  text: 'Error: Vector query type requires an array of numbers',
                },
              ],
            };
          }
        } catch (e) {
          return {
            content: [
              {
                type: "text",
                text: 'Error: Vector query type requires an array of numbers',
              },
            ],
          };
        }
      }

      // Validate query format matches query type
      if (finalQueryType === 'text' && typeof finalQuery !== 'string') {
        return {
          content: [
            {
              type: "text",
              text: 'Error: Text query type requires a string query. Example: "your search text here"',
            },
          ],
        };
      }
      if (finalQueryType === 'vector' && (!Array.isArray(finalQuery) || !finalQuery.every(item => typeof item === 'number'))) {
        return {
          content: [
            {
              type: "text",
              text: 'Error: Vector query type requires an array of numbers. Example: [0.1, 0.2, 0.3, 0.4, 0.5] for 5-dimensional namespace',
            },
          ],
        };
      }

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
  description: "Get AI-generated answers based on data in a namespace using text queries. This tool provides intelligent, context-aware responses by searching through your stored text documents and generating comprehensive answers using advanced language models.",
  parameters: {
    namespace: z.string().min(1).describe("Namespace to answer questions from. Must be a text namespace containing the documents that will be searched to generate answers. The namespace should contain relevant content that can answer the types of questions you expect to ask."),
    query: z.string().min(1).describe("Text query for AI answer generation. Provide a natural language question or prompt that you want the AI to answer. The AI will search through your namespace content and generate a comprehensive response based on the relevant information found."),
    top_k: z.number().int().positive().optional().describe("Number of top results to return. Controls how many relevant documents the AI considers when generating an answer. Default is 5. Use lower values (3-5) for focused answers, higher values (8-10) for comprehensive responses that consider more context."),
    threshold: z.number().min(0).max(1).optional().describe("Similarity threshold for results. A value between 0 and 1 that filters documents based on relevance before generating the answer. Higher values (0.7-0.9) ensure only highly relevant content is used, lower values (0.3-0.5) include more context. Required when kiosk_mode is true."),
    kiosk_mode: z.boolean().optional().describe("Kiosk mode for restricted search. When true, search is restricted to specific namespaces with threshold filtering, providing more controlled and focused answers suitable for production environments."),
    aiModel: z.string().optional().describe("AI model to use for answer generation. Different models may have different capabilities, response styles, and performance characteristics. Supported AI models include: 'anthropic.claude-3-7-sonnet-20250219-v1:0' (Claude 3.7 Sonnet), 'anthropic.claude-sonnet-4-20250514-v1:0' (Claude Sonnet 4), 'meta.llama4-maverick-17b-instruct-v1:0' (Llama 4 Maverick), 'meta.llama3-3-70b-instruct-v1:0' (Llama 3.3 70B), 'deepseek.r1-v1:0' (DeepSeek R1). If not specified, defaults to Claude 3.7 Sonnet."),
    chatHistory: z.array(z.object({
      role: z.string().describe("Role of the message in the conversation. Use 'user' for user messages and 'assistant' for AI responses. This helps maintain conversation context and allows the AI to reference previous exchanges."),
      content: z.string()
    })).optional().describe("Chat history for AI answer generation. Provide previous conversation context to help the AI maintain continuity and reference earlier parts of the conversation. This enables more coherent multi-turn conversations."),
    headerPrompt: z.string().optional().describe("Header prompt for AI answer generation. Custom instructions that define the AI's role, style, and behavior. Use this to create specialized assistants (e.g., technical support, friendly helper, formal advisor) or set specific guidelines for response generation."),
    footerPrompt: z.string().optional().describe("Footer prompt for AI answer generation. Additional instructions that are applied after the main response generation. Useful for formatting requirements, citation styles, or specific response patterns that should be consistently applied."),
    temperature: z.number().min(0).max(2.0).optional().describe("Temperature for AI answer generation. Controls the creativity and randomness of responses. Lower values (0.1-0.3) produce more focused, deterministic answers. Higher values (0.7-1.0) produce more creative, varied responses. Default is 0.7."),
  },
  handler: async ({ namespace, query, top_k = 5, threshold, kiosk_mode = false, aiModel, chatHistory = [], headerPrompt, footerPrompt, temperature = 0.7 }) => {
    try {
      const requestBody = {
        namespace,
        query,
        top_k,
        kiosk_mode,
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
      if (temperature !== undefined) {
        requestBody.temperature = temperature;
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