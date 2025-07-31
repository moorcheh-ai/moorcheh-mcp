# Moorcheh MCP Server

A Model Context Protocol (MCP) server for Moorcheh AI-powered search and answer operations with intelligent autocompletion capabilities.

## Features

- **AI-Powered Search**: Semantic search across text and vector namespaces
- **Bedrock Integration**: Support for multiple AWS Bedrock models
- **Intelligent Autocompletion**: Context-aware suggestions for all parameters
- **Text Namespace Operations**: Specialized prompts for text-based AI operations
- **Vector Search**: Advanced vector similarity search with ITS scoring
- **High-Precision Search**: Configurable thresholds for critical applications

## Available Bedrock Models

| Model ID | Name | Provider | Description |
|----------|------|----------|-------------|
| `anthropic.claude-3-7-sonnet-20250219-v1:0` | Claude 3.7 Sonnet | Anthropic | Latest Claude model with enhanced capabilities |
| `anthropic.claude-sonnet-4-20250514-v1:0` | Claude Sonnet 4 | Anthropic | Latest Claude model with enhanced capabilities |
| `meta.llama4-maverick-17b-instruct-v1:0` | Llama 4 Maverick | Meta | Latest Llama model optimized for instruction following |
| `meta.llama3-3-70b-instruct-v1:0` | Llama 3 70B | Meta | Large Llama model with strong general capabilities |
| `deepseek.r1-v1:0` | DeepSeek-R1 | DeepSeek | Specialized model for research and analysis |

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the project root:

```env
MOORCHEH_API_KEY=your_moorcheh_api_key

## Usage

### Start the server

```bash
npm start
```

### Development mode with auto-reload

```bash
npm run dev
```

## Available Prompts

### Core Prompts

- **`moorcheh-answer`**: Generate AI answers using Bedrock models (TEXT NAMESPACES ONLY)
- **`moorcheh-search`**: Enhanced search across namespaces with intelligent suggestions
- **`moorcheh-semantic-search`**: Semantic search with vector embeddings and ITS scoring
- **`moorcheh-text-search`**: Text-based search with automatic embedding generation
- **`moorcheh-precision-search`**: High-precision search with strict thresholds

### Specialized Prompts

- **`moorcheh-bedrock-config`**: Configure and select Bedrock models with detailed information
- **`moorcheh-text-operations`**: Perform operations specifically on text namespaces (TEXT NAMESPACES ONLY)
- **`moorcheh-data-management`**: Manage data operations with intelligent suggestions

### Utility Prompts

- **`review-code`**: Review code for best practices and potential issues
- **`team-greeting`**: Generate greetings for team members with context-aware completion

## Features

### Intelligent Autocompletion

All prompts feature intelligent autocompletion that:
- Filters namespaces by type (text/vector)
- Suggests appropriate Bedrock models
- Provides relevant parameter ranges
- Adapts suggestions based on previous selections

### Text Namespace Requirements

AI answer operations **require text namespaces only**. The server:
- Automatically filters to show only text namespaces
- Provides clear warnings about vector namespace limitations
- Enforces text-only operations for AI functionality

### Advanced Search Capabilities

- **ITS Scoring**: Information-Theoretic Similarity scoring for vector search
- **Multi-namespace Search**: Search across multiple namespaces simultaneously
- **Threshold Filtering**: Configurable relevance thresholds
- **Kiosk Mode**: Public access mode for specific use cases

## API Integration

The server integrates with Moorcheh's public APIs:
- Namespace management
- Document upload and retrieval
- Vector similarity search
- AI-powered answer generation

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MOORCHEH_API_KEY` | Your Moorcheh API key | Yes |

## Development

### Prerequisites

- Node.js >= 18.0.0
- Valid Moorcheh API key

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file with your API key
4. Run in development mode: `npm run dev`

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:
- GitHub Issues: [ttps://github.com/moorcheh-ai/moorcheh-mcp/issues](https://github.com/moorcheh-ai/moorcheh-mcp/issues)
- Documentation: [https://console.moorcheh.ai/docs](https://console.moorcheh.ai/docs) 
