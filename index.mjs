#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// ========== COMPLETABLE FUNCTIONALITY ==========

// Enum for MCP Zod Type Kind
const McpZodTypeKind = {
  Completable: "McpCompletable"
};

// Main Completable class
class Completable extends z.ZodType {
  constructor(def) {
    super(def);
    this._def = def;
  }

  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx,
    });
  }

  unwrap() {
    return this._def.type;
  }

  static create(type, params) {
    return new Completable({
      type,
      typeName: McpZodTypeKind.Completable,
      complete: params.complete,
      ...processCreateParams(params),
    });
  }
}

// Helper function to process create parameters
function processCreateParams(params) {
  if (!params) return {};
  const { errorMap, invalid_type_error, required_error, description } = params;
  
  if (errorMap && (invalid_type_error || required_error)) {
    throw new Error(
      `Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`,
    );
  }
  
  if (errorMap) return { errorMap: errorMap, description };
  
  const customMap = (iss, ctx) => {
    const { message } = params;

    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type") return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  
  return { errorMap: customMap, description };
}

/**
 * Wraps a Zod type to provide autocompletion capabilities. Useful for, e.g., prompt arguments in MCP.
 */
function completable(schema, complete) {
  return Completable.create(schema, { ...schema._def, complete });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



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

// Load environment variables from .env file silently without dotenv
try {
  const envPath = join(__dirname, '.env');
  const envContent = readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    }
  }
} catch (error) {
  // Silently ignore if .env file doesn't exist
}

// Configure API endpoints
const API_KEY = process.env.MOORCHEH_API_KEY;

if (!API_KEY) {
  console.error('Missing required API_KEY environment variable');
  console.error('Please create a .env file in this directory with: API_KEY=your_actual_api_key');
  process.exit(1);
}

// Debug: Check if API key looks valid (don't log the full key for security)
if (API_KEY === 'your_api_key_here' || API_KEY.length < 10) {
  console.error('Warning: API_KEY appears to be invalid or placeholder');
  console.error('Please check your .env file and ensure you have a valid Moorcheh API key');
}

// Construct API URLs using the simplified format
const constructApiUrl = (endpoint) => {
  return `https://api.moorcheh.ai/v1${endpoint}`;
};

const API_ENDPOINTS = {
  namespaces: constructApiUrl('/namespaces'),
  search: constructApiUrl('/search'),
  answer: constructApiUrl('/answer'),
};

// Helper function to make API requests
async function makeApiRequest(method, url, data = null) {
  try {
    const config = {
      method,
      url,
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    };
    
    if (data) {
      config.data = data;
    }
    
    // Debug: Log request details 
    // console.log(`Making ${method} request to: ${url}`);
    // console.log(`API Key length: ${API_KEY.length} characters`);
    // console.log(`API Key starts with: ${API_KEY.substring(0, 8)}...`);
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 403) {
        throw new Error(`Forbidden: Check your API key. Status: ${status}, Response: ${JSON.stringify(data)}`);
      } else if (status === 401) {
        throw new Error(`Unauthorized: Invalid API key. Status: ${status}, Response: ${JSON.stringify(data)}`);
      } else {
        throw new Error(`API Error (${status}): ${JSON.stringify(data)}`);
      }
    }
    throw new Error(`Network Error: ${error.message}`);
  }
}

// Create server instance
const server = new McpServer({
  name: "Moorcheh",
  version: "1.0.0",
});

// ========== RESOURCES ==========

// Register resource for namespace listing
server.resource(
  "moorcheh://namespaces",
  "List of all Moorcheh namespaces",
  "application/json",
  async () => {
    try {
      const data = await makeApiRequest('GET', API_ENDPOINTS.namespaces);
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return JSON.stringify({ error: error.message }, null, 2);
    }
  }
);

// Register resource for namespace details
server.resource(
  "moorcheh://namespace/{namespace_name}",
  "Details of a specific Moorcheh namespace",
  "application/json",
  async (uri) => {
    try {
      const namespaceName = uri.split('/').pop();
      const data = await makeApiRequest('GET', `${API_ENDPOINTS.namespaces}/${namespaceName}`);
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return JSON.stringify({ error: error.message }, null, 2);
    }
  }
);

// Register resource for API documentation
server.resource(
  "moorcheh://docs/api",
  "Moorcheh API documentation and endpoints",
  "text/markdown",
  async () => {
    return `# Moorcheh API Documentation

## Base URL
\`https://api.moorcheh.ai/v1\`

## Authentication
All requests require an API key in the \`x-api-key\` header.

## Endpoints

### Namespaces
- **GET** \`/namespaces\` - List all namespaces
- **POST** \`/namespaces\` - Create new namespace
- **DELETE** \`/namespaces/{name}\` - Delete namespace
- **GET** \`/namespaces/{name}\` - Get namespace details

### Documents
- **POST** \`/namespaces/{name}/documents\` - Upload text documents
- **POST** \`/namespaces/{name}/vectors\` - Upload vector data
- **POST** \`/namespaces/{name}/documents/delete\` - Delete specific documents

### Search & AI
- **POST** \`/search\` - Search across namespaces
- **POST** \`/answer\` - Get AI-generated answers

## Rate Limits
API requests are subject to rate limiting based on your subscription tier.
`;
  }
);

// Register resource for configuration help
server.resource(
  "moorcheh://config/help",
  "Configuration help and troubleshooting guide",
  "text/markdown",
  async () => {
    return `# Moorcheh Configuration Help

## Environment Variables Required

Create a \`.env\` file in the same directory as this script with:

\`\`\`
API_KEY=your_moorcheh_api_key
\`\`\`

## Troubleshooting

### Common Issues

1. **403 Forbidden Error**
   - Check your API key is correct
   - Ensure your API key has proper permissions

2. **401 Unauthorized Error**
   - Your API key may be invalid or expired
   - Contact support to regenerate your key

3. **Network Errors**
   - Check your internet connection
   - Verify the API endpoint is correct

### Getting Help

For additional support, check:
- Moorcheh documentation
- API status page
- Contact support with your error details
`;
  }
);

// ========== PROMPTS ==========

// Register resource for namespace creation guidance
server.resource(
  "moorcheh://guides/namespace-creation",
  "Step-by-step guide for creating a new Moorcheh namespace, with best practices",
  "text/markdown",
  async () => {
    return `# Moorcheh Namespace Creation Guide

## Step-by-step process:

1. **Choose a descriptive name** for your namespace
   - Use lowercase letters, numbers, and hyphens
   - Make it descriptive of your content
   - Example: "customer-docs", "product-vectors", "help-articles"

2. **Determine the namespace type:**
   - **Text namespace** for storing and searching text documents
     - Ideal for documentation, articles, customer support content
     - Full-text search capabilities included
   - **Vector namespace** for semantic search and AI applications
     - You'll need to specify vector dimensions (commonly 384, 768, or 1536)
     - Compatible with embeddings from OpenAI, Sentence Transformers, etc.

3. **Use the create-namespace tool:**
   \`\`\`
   namespace_name: your-chosen-name
   type: text  # or vector
   vector_dimension: 384  # only for vector namespaces
   \`\`\`

## Best Practices:
- Start with a small test namespace to familiarize yourself
- Plan your document structure and metadata beforehand
- Consider how you'll organize and tag your content
- Test search functionality with sample data

## Next Steps:
After creating your namespace, you can:
- Upload documents using the upload-text tool
- Upload vector embeddings using upload-vectors tool (for vector namespaces)
- Search your content using the search tool
- Get AI-powered answers using the answer tool
`;
  }
);

// Register resource for search optimization guidance
server.resource(
  "moorcheh://guides/search-optimization",
  "Tips for optimizing search queries in Moorcheh",
  "text/markdown",
  async () => {
    return `# Moorcheh Search Optimization Guide

## General Search Strategy

### Text Search Best Practices:
- Use specific, descriptive terms rather than generic ones
- Include key domain terminology from your content field
- Try both short keywords and longer phrases
- Use synonyms if initial searches don't return good results

### Query Examples:
- Instead of: "help"
- Try: "troubleshooting guide", "how to resolve", "step by step"

### Vector Search Best Practices:
- Ensure your query embeddings use the same model as your stored vectors
- Vector search works well with semantic similarity
- Natural language queries often work better than keywords
- Consider the context and intent behind your search

### Query Optimization:
- Use complete sentences or questions for better semantic matching
- Include relevant context in your query
- Test with variations of the same concept

## Parameter Tuning:

1. **top_k**: Number of results to return
   - Start with 5-10 for most use cases
   - Increase for broader exploration
   - Decrease for highly targeted results

2. **threshold**: Similarity threshold (0-1)
   - 0.7-0.8: High similarity, fewer but more relevant results
   - 0.5-0.7: Moderate similarity, balanced results
   - 0.3-0.5: Lower similarity, more comprehensive results

## Troubleshooting:
- If no results: Lower threshold, check spelling, try synonyms
- If too many irrelevant results: Raise threshold, use more specific terms
- If results seem random: Check your embeddings model compatibility
`;
  }
);

// Register resource for data organization guidance
server.resource(
  "moorcheh://guides/data-organization",
  "Best practices for organizing data in Moorcheh namespaces",
  "text/markdown",
  async () => {
    return `# Moorcheh Data Organization Guide

## Namespace Strategy

### Large Team Considerations:
- Create separate namespaces by department or project
- Use consistent naming conventions across teams
- Implement clear metadata standards
- Consider access control and permissions

### Small Team Approach:
- Fewer namespaces with more content per namespace
- Flexible organization that can evolve
- Focus on clear naming and good metadata
- Regular cleanup and maintenance

## Content Organization

1. **Metadata Schema:**
   \`\`\`json
   {
     "category": "primary classification",
     "tags": ["tag1", "tag2", "tag3"],
     "author": "content creator",
     "created_date": "2024-01-01",
     "department": "relevant team",
     "priority": "high/medium/low",
     "status": "draft/review/published"
   }
   \`\`\`

2. **Document ID Conventions:**
   - Use descriptive, hierarchical IDs
   - Include date/version when relevant
   - Examples: "support-faq-login-2024", "product-spec-v2-auth"

3. **Content Chunking:**
   - Break large documents into logical sections
   - Each chunk should be self-contained
   - Include context in metadata

## Maintenance Workflow

1. **Regular Reviews:**
   - Monthly metadata cleanup
   - Remove outdated content
   - Update tags and categories

2. **Quality Control:**
   - Standardize formatting before upload
   - Validate metadata completeness
   - Test search functionality after major updates

3. **Growth Planning:**
   - Monitor namespace size and performance
   - Plan for content archival strategy
   - Consider splitting namespaces as they grow

## Search-Friendly Organization
- Use consistent terminology in your content
- Include alternative phrasings in metadata
- Create logical content hierarchies
- Tag content with multiple relevant categories
`;
  }
);

// Register resource for AI answer configuration guidance
server.resource(
  "moorcheh://guides/ai-answer-setup",
  "Guide for configuring AI-powered answers in Moorcheh",
  "text/markdown",
  async () => {
    return `# Moorcheh AI Answer Configuration Guide

## Header Prompt Configuration

\`\`\`
You are an AI assistant specialized in your domain. 
Your role is to provide balanced answers based on the provided context.

Style Guidelines:
- Balance brevity with completeness
- Use clear, professional language
- Structure information logically
- Include key details without overwhelming

Context: You have access to documentation and resources.
\`\`\`

## Footer Prompt Configuration

\`\`\`
Additional Guidelines:
- Always cite specific sources when possible
- If information is incomplete, acknowledge limitations
- Suggest follow-up questions for complex topics
- Provide practical next steps

Response Format:
- Start with a direct answer to the question
- Support with relevant context from the knowledge base
- End with helpful next steps or related information
\`\`\`

## Parameter Recommendations

1. **Temperature**: 0.5-0.7 (balanced)

2. **top_k**: 
   - 3-5 for focused answers
   - 5-8 for comprehensive responses
   - 8-10 for exploratory questions

3. **threshold**: 
   - 0.7+ for high confidence answers
   - 0.5-0.7 for broader context inclusion

## Chat History Usage

Include previous conversation context to:
- Maintain conversation flow
- Reference previous questions
- Build on established context
- Avoid repeating information

## Example Usage

\`\`\`javascript
{
  "namespace": "your-namespace",
  "query": "How do I configure authentication?",
  "headerPrompt": "You are a technical assistant...",
  "footerPrompt": "Always include code examples...",
  "temperature": 0.5,
  "top_k": 5,
  "chatHistory": [
    {"role": "user", "content": "Previous question..."},
    {"role": "assistant", "content": "Previous answer..."}
  ]
}
\`\`\`
`;
  }
);

// Register Moorcheh tools
server.tool(
  "list-namespaces",
  "List all available namespaces in Moorcheh",
  {},
  async () => {
    try {
      const data = await makeApiRequest('GET', API_ENDPOINTS.namespaces);
      
      if (!data.namespaces || data.namespaces.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No namespaces found",
            },
          ],
        };
      }

      const formattedNamespaces = data.namespaces.map((ns) =>
        [
          `Namespace: ${ns.namespace_name}`,
          `Type: ${ns.type}`,
          `Vector Dimension: ${ns.vector_dimension || 'N/A'}`,
          `Created: ${ns.createdAt}`,
          `Items: ${ns.itemCount}`,
          "---",
        ].join("\n")
      );

      const namespacesText = `Available namespaces:\n\n${formattedNamespaces.join("\n")}`;

      return {
        content: [
          {
            type: "text",
            text: namespacesText,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error listing namespaces: ${error.message}`,
          },
        ],
      };
    }
  },
);

server.tool(
  "create-namespace",
  "Create a new namespace for document storage in Moorcheh",
  {
    namespace_name: z.string().describe("Name of the namespace to create"),
    type: z.string().optional().describe("Type of namespace (text, vector, etc.)"),
    vector_dimension: z.number().optional().describe("Vector dimension for vector namespaces"),
  },
  async ({ namespace_name, type = "text", vector_dimension }) => {
    try {
      const data = await makeApiRequest('POST', API_ENDPOINTS.namespaces, {
        namespace_name,
        type,
        vector_dimension,
      });

      const resultText = `Successfully created namespace "${namespace_name}":\n${JSON.stringify(data, null, 2)}`;

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
            text: `Error creating namespace: ${error.message}`,
          },
        ],
      };
    }
  },
);

server.tool(
  "delete-namespace",
  "Delete a namespace and all its contents from Moorcheh",
  {
    namespace_name: z.string().describe("Name of the namespace to delete"),
  },
  async ({ namespace_name }) => {
    try {
      const data = await makeApiRequest('DELETE', `${API_ENDPOINTS.namespaces}/${namespace_name}`);

      const resultText = `Successfully deleted namespace "${namespace_name}":\n${JSON.stringify(data, null, 2)}`;

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
            text: `Error deleting namespace: ${error.message}`,
          },
        ],
      };
    }
  },
);

server.tool(
  "upload-text",
  "Upload text documents to a namespace in Moorcheh",
  {
    namespace_name: z.string().describe("Name of the namespace to upload to"),
    documents: z.array(z.object({
      id: z.string().describe("Unique identifier for the document"),
      text: z.string().describe("Text content of the document"),
      metadata: z.record(z.string(), z.any()).optional().describe("Optional metadata for the document"),
    })).describe("Array of documents to upload"),
  },
  async ({ namespace_name, documents }) => {
    try {
      const data = await makeApiRequest('POST', `${API_ENDPOINTS.namespaces}/${namespace_name}/documents`, {
        documents,
      });

      const resultText = `Successfully uploaded ${documents.length} document(s) to namespace "${namespace_name}":\n${JSON.stringify(data, null, 2)}`;

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
            text: `Error uploading text documents: ${error.message}`,
          },
        ],
      };
    }
  },
);

server.tool(
  "upload-vectors",
  "Upload vector data to a namespace in Moorcheh",
  {
    namespace_name: z.string().describe("Name of the namespace to upload to"),
    vectors: z.array(z.object({
      id: z.string().describe("Unique identifier for the vector"),
      vector: z.array(z.number()).describe("Vector values"),
      metadata: z.record(z.string(), z.any()).optional().describe("Optional metadata for the vector"),
    })).describe("Array of vectors to upload"),
  },
  async ({ namespace_name, vectors }) => {
    try {
      const data = await makeApiRequest('POST', `${API_ENDPOINTS.namespaces}/${namespace_name}/vectors`, {
        vectors,
      });

      const resultText = `Successfully uploaded ${vectors.length} vector(s) to namespace "${namespace_name}":\n${JSON.stringify(data, null, 2)}`;

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
            text: `Error uploading vectors: ${error.message}`,
          },
        ],
      };
    }
  },
);

server.tool(
  "delete-data",
  "Delete specific data items from a namespace in Moorcheh",
  {
    namespace_name: z.string().describe("Name of the namespace to delete from"),
    ids: z.array(z.string()).describe("Array of document/vector IDs to delete"),
  },
  async ({ namespace_name, ids }) => {
    try {
      const data = await makeApiRequest('POST', `${API_ENDPOINTS.namespaces}/${namespace_name}/documents/delete`, {
        ids,
      });

      const resultText = `Successfully deleted ${ids.length} item(s) from namespace "${namespace_name}":\n${JSON.stringify(data, null, 2)}`;

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
            text: `Error deleting data: ${error.message}`,
          },
        ],
      };
    }
  },
);

server.tool(
  "search",
  "Search across namespaces with vector similarity in Moorcheh",
  {
    namespaces: z.array(z.string()).describe("Array of namespace names to search in"),
    query: z.union([z.string(), z.array(z.number())]).describe("Search query - can be text string or vector array of numbers"),
    top_k: z.number().optional().describe("Number of top results to return (default: 10)"),
    threshold: z.number().min(0).max(1).optional().describe("Similarity threshold for results (0-1)"),
    kiosk_mode: z.boolean().optional().describe("Enable kiosk mode for public access"),
  },
  async ({ namespaces, query, top_k = 10, threshold, kiosk_mode = false }) => {
    try {
      // --- NEW LOGIC: Fetch namespace info and parse query if needed ---
      let finalQuery = query;
      if (namespaces && namespaces.length > 0 && typeof query === 'string') {
        // Fetch namespace info for the first namespace
        const nsInfoResp = await makeApiRequest('GET', `${API_ENDPOINTS.namespaces}/${namespaces[0]}`);
        const nsInfo = nsInfoResp.namespace || nsInfoResp; // handle possible response shape
        if (nsInfo && nsInfo.type === 'vector') {
          // Try to parse the string into an array of numbers
          const arr = query.split(',').map(s => parseFloat(s.trim())).filter(v => !isNaN(v));
          if (!arr.length || arr.length !== (nsInfo.vector_dimension || arr.length)) {
            return {
              content: [
                {
                  type: "text",
                  text: `Error: Query string could not be parsed into a valid ${nsInfo.vector_dimension || ''}-dimensional vector array. Please provide a comma-separated list of numbers matching the namespace dimension.`,
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
);

server.tool(
  "answer",
  "Get AI-generated answers based on data in a namespace using Moorcheh",
  {
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
  async ({ namespace, query, top_k = 5, threshold, type = 'text', kiosk_mode = false, aiModel, chatHistory = [], headerPrompt, footerPrompt, temperature = 0.7 }) => {
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
);


// ========== PROMPTS ==========

  // Register prompt for search optimization
  server.registerPrompt(
    'search-optimization',
    'Tips for optimizing search queries in Moorcheh',
    [
      {
        name: 'search_type',
        description: 'Type of search (text or vector)',
        required: false
      },
      {
        name: 'domain',
        description: 'Domain or topic area of your content',
        required: false
      }
    ],
    async (args) => {
      const searchType = args?.search_type || 'text';
      const domain = args?.domain || 'general';
      
      return `# Moorcheh Search Optimization Guide

## Optimizing ${searchType} search for ${domain} content

### Request Format Examples:

**Text Search Request:**
\`\`\`json
{
  "query": "your search text here",
  "namespaces": ["your-namespace"],
  "top_k": 10,
  "kiosk_mode": false
}
\`\`\`

**Vector Search Request:**
\`\`\`json
{
  "query": [0.1, 0.2, 0.3, ..., 0.768],
  "namespaces": ["vector-embeddings"],
  "top_k": 5,
  "kiosk_mode": true,
  "threshold": 0.1
}
\`\`\`

**cURL Example for Vector Search:**
\`\`\`bash
curl -X POST "https://api.moorcheh.ai/v1/search" \\
  -H "Content-Type: application/json" \\
  -H "x-api-Key: your-api-key-here" \\
  -d '{
    "query": [0.1, 0.2, 0.3, ..., 0.768],
    "namespaces": ["vector-embeddings"],
    "top_k": 5,
    "kiosk_mode": true,
    "threshold": 0.1
  }'
\`\`\`

### Search Strategy:

${searchType === 'text' ? `
**Text Search Best Practices:**
- Use specific, descriptive terms rather than generic ones
- Include key domain terminology from your ${domain} field
- Try both short keywords and longer phrases
- Use synonyms if initial searches don't return good results
- Natural language queries work well for semantic search

**Query Examples:**
- Instead of: "help"
- Try: "troubleshooting guide", "how to resolve", "step by step"
- Use complete sentences: "How do I configure authentication?"
- Include context: "Python authentication setup for web applications"
` : `
**Vector Search Best Practices:**
- Ensure your query embeddings use the same model as your stored vectors
- Vector search works well with semantic similarity
- Natural language queries often work better than keywords
- Consider the context and intent behind your search
- Match vector dimensions with your namespace configuration

**Query Optimization:**
- Use complete sentences or questions for better semantic matching
- Include relevant context in your query
- Test with variations of the same concept
- Ensure vector dimensions match your namespace (e.g., 768 for many models)
`}

### Parameter Tuning:

1. **top_k**: Number of results to return (default: 10)
   - Start with 5-10 for most use cases
   - Increase for broader exploration
   - Decrease for highly targeted results

2. **threshold**: Similarity threshold (0-1, optional)
   - 0.7-0.8: High similarity, fewer but more relevant results
   - 0.5-0.7: Moderate similarity, balanced results
   - 0.3-0.5: Lower similarity, more comprehensive results
   - **Important**: When kiosk_mode is true, threshold becomes mandatory

3. **kiosk_mode**: Boolean (default: false)
   - true: Restrict search to specific namespace(s) with threshold filtering
   - false: Search across all specified namespaces
   - **Note**: When kiosk_mode is enabled, threshold parameter is required

### Kiosk Mode Requirements:

When using kiosk_mode=true:
- **threshold parameter is mandatory**
- Results are filtered by the specified threshold
- Useful for production environments with strict relevance requirements
- Example: kiosk_mode=true with threshold=0.7 ensures only high-confidence results

### Domain-Specific Tips for ${domain}:
- Use terminology specific to ${domain}
- Consider the typical language patterns in your content
- Test with actual user queries from your ${domain} context
- Monitor search performance and adjust parameters accordingly
- For technical content, include specific technology names and versions

### Troubleshooting:
- If no results: Lower threshold, check spelling, try synonyms
- If too many irrelevant results: Raise threshold, use more specific terms
- If results seem random: Check your embeddings model compatibility
- For vector search: Verify vector dimensions match namespace configuration
- For kiosk mode: Ensure threshold is provided when kiosk_mode=true

### Response Format:
The search returns results with:
- **id**: Document identifier
- **score**: Similarity score (0-1, higher is better)
- **label**: Relevance label (Close Match, Very High Relevance, etc.)
- **text**: Original text content (for text namespaces)
- **metadata**: Associated metadata
`;
    }
  );

  // Register prompt for data organization
  server.registerPrompt(
    'data-organization',
    'Best practices for organizing data in Moorcheh namespaces',
    [
      {
        name: 'content_type',
        description: 'Type of content you\'re organizing',
        required: false
      },
      {
        name: 'team_size',
        description: 'Size of your team using this data',
        required: false
      }
    ],
    async (args) => {
      const contentType = args?.content_type || 'documents';
      const teamSize = args?.team_size || 'small';
      
      return `# Moorcheh Data Organization Guide

## Organizing ${contentType} for a ${teamSize} team

### Namespace Strategy:

${teamSize === 'large' ? `
**Large Team Considerations:**
- Create separate namespaces by department or project
- Use consistent naming conventions across teams
- Implement clear metadata standards
- Consider access control and permissions
` : `
**Small Team Approach:**
- Fewer namespaces with more content per namespace
- Flexible organization that can evolve
- Focus on clear naming and good metadata
- Regular cleanup and maintenance
`}

### Content Organization for ${contentType}:

1. **Metadata Schema:**
   \`\`\`json
   {
     "category": "primary classification",
     "tags": ["tag1", "tag2", "tag3"],
     "author": "content creator",
     "created_date": "2024-01-01",
     "department": "relevant team",
     "priority": "high/medium/low",
     "status": "draft/review/published"
   }
   \`\`\`

2. **Document ID Conventions:**
   - Use descriptive, hierarchical IDs
   - Include date/version when relevant
   - Examples: "support-faq-login-2024", "product-spec-v2-auth"

3. **Content Chunking:**
   - Break large documents into logical sections
   - Each chunk should be self-contained
   - Include context in metadata

### Maintenance Workflow:

1. **Regular Reviews:**
   - Monthly metadata cleanup
   - Remove outdated content
   - Update tags and categories

2. **Quality Control:**
   - Standardize formatting before upload
   - Validate metadata completeness
   - Test search functionality after major updates

3. **Growth Planning:**
   - Monitor namespace size and performance
   - Plan for content archival strategy
   - Consider splitting namespaces as they grow

### Search-Friendly Organization:
- Use consistent terminology in your ${contentType}
- Include alternative phrasings in metadata
- Create logical content hierarchies
- Tag content with multiple relevant categories

This organization will help your ${teamSize} team efficiently manage and search through your ${contentType}.
`;
    }
  );

  // Register prompt for AI answer configuration
  server.registerPrompt(
    'ai-answer-setup',
    'Guide for configuring AI-powered answers in Moorcheh',
    [
      {
        name: 'answer_style',
        description: 'Desired style for AI answers (concise, detailed, technical, friendly)',
        required: false
      },
      {
        name: 'context_type',
        description: 'Type of context/domain for answers',
        required: false
      }
    ],
    async (args) => {
      const answerStyle = args?.answer_style || 'balanced';
      const contextType = args?.context_type || 'general';
      
      return `# Moorcheh AI Answer Configuration Guide

## Setting up ${answerStyle} AI answers for ${contextType} content

### Header Prompt Configuration:

\`\`\`
You are an AI assistant specialized in ${contextType}. 
Your role is to provide ${answerStyle} answers based on the provided context.

Style Guidelines:
${answerStyle === 'concise' ? `
- Keep answers brief and to the point
- Use bullet points for multiple items
- Avoid unnecessary explanations
- Focus on actionable information
` : answerStyle === 'detailed' ? `
- Provide comprehensive explanations
- Include relevant background information
- Use examples where helpful
- Structure answers with clear sections
` : answerStyle === 'technical' ? `
- Use precise technical terminology
- Include code examples when relevant
- Explain complex concepts step-by-step
- Reference specific technical details
` : answerStyle === 'friendly' ? `
- Use conversational, approachable language
- Include encouraging phrases
- Explain concepts in simple terms
- Ask clarifying questions when needed
` : `
- Balance brevity with completeness
- Use clear, professional language
- Structure information logically
- Include key details without overwhelming
`}

Context: You have access to ${contextType} documentation and resources.
\`\`\`

### Footer Prompt Configuration:

\`\`\`
Additional Guidelines:
- Always cite specific sources when possible
- If information is incomplete, acknowledge limitations
- Suggest follow-up questions for complex topics
- ${contextType === 'technical' ? 'Include relevant code snippets or examples' : 'Provide practical next steps'}

Response Format:
- Start with a direct answer to the question
- Support with relevant context from the knowledge base
- End with helpful next steps or related information
\`\`\`

### Parameter Recommendations:

1. **Temperature**: 
   ${answerStyle === 'technical' ? '0.3-0.5 (more precise, less creative)' : answerStyle === 'friendly' ? '0.7-0.9 (more conversational)' : '0.5-0.7 (balanced)'}

2. **top_k**: 
   - 3-5 for focused answers
   - 5-8 for comprehensive responses
   - 8-10 for exploratory questions

3. **threshold**: 
   - 0.7+ for high confidence answers
   - 0.5-0.7 for broader context inclusion

### Chat History Usage:

Include previous conversation context to:
- Maintain conversation flow
- Reference previous questions
- Build on established context
- Avoid repeating information

### Example Usage:

\`\`\`javascript
{
  "namespace": "your-namespace",
  "query": "How do I configure authentication?",
  "headerPrompt": "You are a technical assistant...",
  "footerPrompt": "Always include code examples...",
  "temperature": 0.5,
  "top_k": 5,
  "chatHistory": [
    {"role": "user", "content": "Previous question..."},
    {"role": "assistant", "content": "Previous answer..."}
  ]
}
\`\`\`

This configuration will provide ${answerStyle} answers tailored to your ${contextType} use case.
`;
    }
  );
// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("Server started");

}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
}); 