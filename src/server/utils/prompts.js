import { z } from 'zod';

// Search optimization prompt
export const searchOptimizationPrompt = {
  name: 'search-optimization',
  description: 'Tips for optimizing search queries in Moorcheh',
  argsSchema: {
    search_type: z.enum(['text','vector']).optional().describe('Type of search (text or vector)'),
    domain: z.string().optional().describe('Domain or topic area of your content')
  },
  handler: async (args) => {
    const searchType = args?.search_type || 'text';
    const domain = args?.domain || 'general';
    
    const text = `# Moorcheh Search Optimization Guide

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

    return {
      messages: [
        {
          role: 'assistant',
          content: { type: 'text', text }
        }
      ]
    };
  }
};

// Data organization prompt
export const dataOrganizationPrompt = {
  name: 'data-organization',
  description: 'Best practices for organizing data in Moorcheh namespaces',
  argsSchema: {
    content_type: z.string().optional().describe("Type of content you're organizing"),
    team_size: z.enum(['small','large']).optional().describe('Size of your team using this data')
  },
  handler: async (args) => {
    const contentType = args?.content_type || 'documents';
    const teamSize = args?.team_size || 'small';
    
    const text = `# Moorcheh Data Organization Guide

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

    return {
      messages: [
        {
          role: 'assistant',
          content: { type: 'text', text }
        }
      ]
    };
  }
};

// AI answer setup prompt
export const aiAnswerSetupPrompt = {
  name: 'ai-answer-setup',
  description: 'Guide for configuring AI-powered answers in Moorcheh',
  argsSchema: {
    answer_style: z.enum(['concise','detailed','technical','friendly','balanced']).optional().describe('Desired style for AI answers'),
    context_type: z.string().optional().describe('Type of context/domain for answers')
  },
  handler: async (args) => {
    const answerStyle = args?.answer_style || 'balanced';
    const contextType = args?.context_type || 'general';
    
    const text = `# Moorcheh AI Answer Configuration Guide

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

    return {
      messages: [
        {
          role: 'assistant',
          content: { type: 'text', text }
        }
      ]
    };
  }
}; 