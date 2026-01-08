# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.1]

### Security
- Fixed high severity vulnerabilities in dependencies
  - Updated `@modelcontextprotocol/sdk` from `^1.17.0` to `^1.25.2` (fixes ReDoS vulnerability GHSA-8r9q-7v3j-jr4g and DNS rebinding protection issue)
  - Updated `axios` from `^1.11.0` to `^1.12.0` (fixes DoS vulnerability GHSA-4hjh-wcwx-xvwj)
  - Fixed transitive dependency vulnerabilities in `body-parser` and `qs`

## [1.3.0]

### Added
- File upload endpoint (`upload-file` tool)
  - Supports direct file uploads to text-type namespaces
  - Supported file types: `.pdf`, `.docx`, `.xlsx`, `.json`, `.txt`, `.csv`, `.md` (max 10MB)

### Changed
- Updated supported Bedrock models list
  - Added new model entries and updated model descriptions

## [1.2.2]

### Changed
- Package Name: Updated to `@moorchehai/mcp` for official Moorcheh organization
- Package Structure: Configured for npm registry publishing

### Added
- NPX Support: Added CLI wrapper for seamless `npx -y @moorchehai/mcp` execution
- CLI Features: Added help, version commands and API key validation

### Improved
- User Experience: Improved error messages and installation guidance

## [1.2.1]

### Added
- NPX Support: Added CLI wrapper for seamless `npx -y @moorcheh/mcp` execution
- CLI Features: Added help, version commands and API key validation

### Changed
- Package Structure: Configured for npm registry publishing as `@moorcheh/mcp`

### Improved
- User Experience: Improved error messages and installation guidance

## [1.2.0]

### Added
- New tool: `get-data` to fetch documents by ID from text namespaces (POST /namespaces/{name}/documents/get)

### Changed
- Reliability: Static documentation resources to avoid invalid URI errors in MCP clients
- Windows compatibility: Use ';' for command chaining in PowerShell
- Stability: Ensured stdout handling respects MCP JSON-RPC framing

## [1.1.0]

### Added
- Comprehensive argument schemas with Zod validation

### Changed
- Enhanced prompt system with dynamic content generation
- Improved search optimization, data organization, and AI answer setup prompts
- Updated prompt registration to use new MCP SDK signature
- Better user guidance and interactive prompt responses

## [1.0.0]

### Added
- Initial release with MCP server functionality
- Support for text and vector operations
- AI-powered answer generation
- Comprehensive documentation
