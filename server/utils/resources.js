import { makeApiRequest, API_ENDPOINTS } from '../config/api.js';

// Resource for namespace listing
export const namespacesResource = {
  uri: "https://console.moorcheh.ai/docs",
  description: "List of all Moorcheh namespaces",
  mimeType: "application/json",
  handler: async () => {
    try {
      const data = await makeApiRequest('GET', API_ENDPOINTS.namespaces);
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return JSON.stringify({ error: error.message }, null, 2);
    }
  }
};

// Resource for namespace details
export const namespaceDetailsResource = {
  uri: "moorcheh://namespace/{namespace_name}",
  description: "Details of a specific Moorcheh namespace",
  mimeType: "application/json",
  handler: async (uri) => {
    try {
      const namespaceName = uri.split('/').pop();
      const data = await makeApiRequest('GET', `${API_ENDPOINTS.namespaces}/${namespaceName}`);
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return JSON.stringify({ error: error.message }, null, 2);
    }
  }
};

// Resource for API documentation
export const apiDocsResource = {
  uri: "moorcheh://docs/api",
  description: "Moorcheh API documentation and endpoints",
  mimeType: "text/markdown",
  handler: async () => {
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
};

// Resource for configuration help
export const configHelpResource = {
  uri: "moorcheh://config/help",
  description: "Configuration help and troubleshooting guide",
  mimeType: "text/markdown",
  handler: async () => {
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
};

// Resource for namespace creation guidance
export const namespaceCreationGuideResource = {
  uri: "moorcheh://guides/namespace-creation",
  description: "Step-by-step guide for creating a new Moorcheh namespace, with best practices",
  mimeType: "text/markdown",
  handler: async () => {
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
};

// Resource for search optimization guidance
export const searchOptimizationGuideResource = {
  uri: "moorcheh://guides/search-optimization",
  description: "Tips for optimizing search queries in Moorcheh",
  mimeType: "text/markdown",
  handler: async () => {
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
};

// Resource for data organization guidance
export const dataOrganizationGuideResource = {
  uri: "moorcheh://guides/data-organization",
  description: "Best practices for organizing data in Moorcheh namespaces",
  mimeType: "text/markdown",
  handler: async () => {
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
};

// Resource for AI answer configuration guidance
export const aiAnswerSetupGuideResource = {
  uri: "moorcheh://guides/ai-answer-setup",
  description: "Guide for configuring AI-powered answers in Moorcheh",
  mimeType: "text/markdown",
  handler: async () => {
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
}; 