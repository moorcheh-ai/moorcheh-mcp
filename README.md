<div align="left">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/moorcheh-logo-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="assets/moorcheh-logo-light.svg">
    <img width="250px" alt="Moorcheh Logo" src="assets/moorcheh-logo-light.svg">
  </picture>
  <br />
  <h1>Moorcheh MCP Server</h1>
  <p>A Model Context Protocol (MCP) server that provides seamless integration with Moorcheh's Embedding, Vector Store, Search, and Gen AI Answer services. This server enables you to interact with Moorcheh's comprehensive AI capabilities including document embedding, vector storage, semantic search, and AI-powered answer generation through the Model Context Protocol.</p>
</div>



## Quick Start Guide

There are two ways to use the Moorcheh MCP server:

### Option 1: NPX (Recommended - No Installation Required)

The easiest way to get started:

```bash
# Set your API key and run directly
MOORCHEH_API_KEY=your_api_key_here npx -y @moorcheh/mcp
```

### Option 2: Manual Installation

If you prefer to clone and run locally:

1. **Clone the repository**
   ```bash
   git clone https://github.com/moorcheh-ai/moorcheh-mcp.git
   cd moorcheh-mcp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

### Step 2: Configure Your API Key

1. **Get your Moorcheh API key**
   - Visit [Moorcheh Dashboard](https://app.moorcheh.ai)
   - Sign in to your account
   - Go to your account settings
   - Generate or copy your API key

2. **Set up your environment**
   ```bash
   # Copy the example environment file
   cp env.example .env
   ```

3. **Edit the .env file**
   ```bash
   # Open .env in your preferred editor
   # Replace 'your_moorcheh_api_key_here' with your actual API key
   MOORCHEH_API_KEY=your_actual_api_key_here
   ```

### Step 3: Start the Server

```bash
npm start
```

That's it! Your Moorcheh MCP server is now running and ready to use.

## Setting Up with Claude Desktop

To use the Moorcheh MCP server with Claude Desktop:



https://github.com/user-attachments/assets/fccbba8e-7393-4b74-8a73-769b55b3f3a3


### Step 1: Install Claude Desktop
1. Download Claude Desktop from [https://claude.ai/download](https://claude.ai/download)
2. Install and launch Claude Desktop

### Step 2: Configure MCP Server

**Option A: Using NPX (Recommended)**
1. In Claude Desktop, go to **Settings** → **Developer** 
2. Click **Edit Config**
3. Configure the server with these settings:
   ```json
   {
      "mcpServers": { 
            "moorcheh": {
               "command": "npx",
               "args": ["-y", "@moorcheh/mcp"],
               "env": {
                  "MOORCHEH_API_KEY": "your_actual_api_key_here"
               }
            }
      }
   }
   ```

**Option B: Local Installation**
1. In Claude Desktop, go to **Settings** → **Developer** 
2. Click **Edit Config**
3. Configure the server with these settings:
   ```json
   {
      "mcpServers":{ 
            "moorcheh": {
               "command": "node",
               "args": [
               "path\\to\\moorcheh-mcp\\src\\server\\index.js"
               ],
               "env": {
               "NODE_ENV": "development"
               }
            }
      }
   }
   ```

3. **Important**: 
   - For **Option A**: Replace `your_actual_api_key_here` with your actual Moorcheh API key
   - For **Option B**: Replace `path\\to\\moorcheh-mcp\\src\\server\\index.js` with the actual path to your `index.js` file and create .env in **moorcheh-mcp** with your API key
4. Save the configuration file and restart Claude Desktop completely 

### Step 3: Test the Connection
1. Start a new conversation in Claude Desktop
2. Ask Claude to list the available tools: "Can you list down my namespaces?"
3. You should see tools like `list-namespaces`, `search`, `answer`, etc.

## Setting Up with Cursor

To use the Moorcheh MCP server with Cursor IDE:

### Step 1: Install Cursor
1. Download Cursor from [https://cursor.com](https://cursor.com)
2. Install and launch Cursor

### Step 2: Configure MCP Server

**Option A: Using NPX (Recommended)**
1. In Cursor, go to **Settings** → **Tools & integration** 
2. Click **Add MCP Server**
3. Configure the server with these settings:
```json
{
   "mcpServers": { 
         "moorcheh": {
            "command": "npx",
            "args": ["-y", "@moorcheh/mcp"],
            "env": {
               "MOORCHEH_API_KEY": "your_actual_api_key_here"
            }
         }
   }
}
```

**Option B: Local Installation**
1. In Cursor, go to **Settings** → **Tools & integration** 
2. Click **Add MCP Server**
3. Configure the server with these settings:
```json
{
   "mcpServers":{ 
         "moorcheh": {
            "command": "node",
            "args": [
            "path\\to\\moorcheh-mcp\\src\\server\\index.js"
            ],
            "env": {
            "NODE_ENV": "development"
            }
         }
   }
}
```

### Step 3: Set Your API Key
- **For Option A**: Replace `your_actual_api_key_here` with your actual Moorcheh API key in the configuration
- **For Option B**: Create .env in **moorcheh-mcp** directory and add your API key with `MOORCHEH_API_KEY=your_key_here`

### Step 4: Test the Connection
1. Open a new chat in Cursor (Cmd/Ctrl + L)
2. Ask the AI to list available Moorcheh tools: "What Moorcheh tools can I use?"
3. You should see tools like `list-namespaces`, `search`, `answer`, etc.


## What This Server Does

The Moorcheh MCP server provides tools for:

- **Namespace Management**: Create, list, and delete namespaces for organizing your data
- **Document Operations**: Upload and manage text documents and vector embeddings
- **Advanced Search**: Perform semantic search across your data 
- **AI-Powered Answers**: Get intelligent responses based on your stored data 

## Available Tools

### Namespace Tools
- **`list-namespaces`**: View all your available namespaces
- **`create-namespace`**: Create a new namespace for storing data
- **`delete-namespace`**: Remove a namespace and all its contents

### Data Tools
- **`upload-text`**: Upload text documents to a namespace
- **`upload-vectors`**: Upload vector embeddings to a namespace
- **`get-data`**: Retrieve text documents by ID from text namespaces
- **`delete-data`**: Remove specific data items from a namespace

### Search & AI Tools
- **`search`**: Search across namespaces with vector similarity
- **`answer`**: Get AI-generated answers based on top of your search 

## Supported Bedrock Models

| Model ID | Name | Provider | Description |
|----------|------|----------|-------------|
| `anthropic.claude-3-7-sonnet-20250219-v1:0` | Claude 3.7 Sonnet | Anthropic | Latest Claude model with enhanced capabilities |
| `anthropic.claude-sonnet-4-20250514-v1:0` | Claude Sonnet 4 | Anthropic | Latest Claude model with enhanced capabilities |
| `meta.llama4-maverick-17b-instruct-v1:0` | Llama 4 Maverick | Meta | Latest Llama model optimized for instruction following |
| `meta.llama3-3-70b-instruct-v1:0` | Llama 3 70B | Meta | Large Llama model with strong general capabilities |
| `deepseek.r1-v1:0` | DeepSeek-R1 | DeepSeek | Specialized model for research and analysis |

## Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **Moorcheh Account**: Active account with API access
- **Git**: For cloning the repository

## Development

### Development Mode
For development with auto-reload:
```bash
npm run dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start the MCP server |
| `npm run dev` | Start in development mode with auto-reload |
| `npm test` | Run tests (when available) |


## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MOORCHEH_API_KEY` | Your Moorcheh API key | Yes | None |

## Troubleshooting

### Common Issues

1. **"Missing required API_KEY environment variable"**
   - Make sure you've created a `.env` file
   - Verify your API key is correctly set in the `.env` file
   - Check that the API key is valid in your Moorcheh dashboard

2. **"Forbidden: Check your API key"**
   - Your API key may be invalid or expired
   - Generate a new API key from the Moorcheh dashboard
   - Update your `.env` file with the new key

3. **"Network Error"**
   - Check your internet connection
   - Verify the API endpoints are accessible
   - Try again in a few minutes

### Getting Help

- **GitHub Issues**: [https://github.com/moorcheh-ai/moorcheh-mcp/issues](https://github.com/moorcheh-ai/moorcheh-mcp/issues)
- **Moorcheh Documentation**: [https://console.moorcheh.ai/docs/mcp](https://console.moorcheh.ai/docs/mcp)
- **Moorcheh Dashboard**: [https://console.moorcheh.ai](https://console.moorcheh.ai)

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## Changelog

### v1.2.1
- NPX Support: Added CLI wrapper for seamless `npx -y @moorcheh/mcp` execution
- Package Structure: Configured for npm registry publishing as `@moorcheh/mcp`
- CLI Features: Added help, version commands and API key validation
- User Experience: Improved error messages and installation guidance

### v1.2.0
- New tool: `get-data` to fetch documents by ID from text namespaces (POST /namespaces/{name}/documents/get)
- Reliability: Static documentation resources to avoid invalid URI errors in MCP clients
- Windows compatibility: Use ';' for command chaining in PowerShell
- Stability: Ensured stdout handling respects MCP JSON-RPC framing

### v1.1.0
- Enhanced prompt system with dynamic content generation
- Added comprehensive argument schemas with Zod validation
- Improved search optimization, data organization, and AI answer setup prompts
- Updated prompt registration to use new MCP SDK signature
- Better user guidance and interactive prompt responses

### v1.0.0
- Initial release with MCP server functionality
- Support for text and vector operations
- AI-powered answer generation
- Comprehensive documentation 
