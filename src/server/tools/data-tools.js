import { z } from 'zod';
import { makeApiRequest, API_ENDPOINTS, uploadFile } from '../config/api.js';

// Upload text documents tool
export const uploadTextTool = {
  name: "upload-text",
  description: "Upload text documents to a namespace in Moorcheh",
  parameters: {
    namespace_name: z.string().describe("Name of the namespace to upload to"),
    documents: z.array(z.object({
      id: z.string().describe("Unique identifier for the document"),
      text: z.string().describe("Text content of the document"),
      metadata: z.record(z.string(), z.any()).optional().describe("Optional metadata for the document. Will be flattened as top-level fields to match API format."),
    })).describe("Array of documents to upload"),
  },
  handler: async ({ namespace_name, documents }) => {
    try {
      const normalizedDocuments = documents.map((doc) => {
        const { metadata, ...rest } = doc;
        return metadata && typeof metadata === 'object'
          ? { ...rest, ...metadata }
          : rest;
      });

      const data = await makeApiRequest('POST', `${API_ENDPOINTS.namespaces}/${namespace_name}/documents`, {
        documents: normalizedDocuments,
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
};

// Upload vectors tool
export const uploadVectorsTool = {
  name: "upload-vectors",
  description: "Upload vector data to a namespace in Moorcheh",
  parameters: {
    namespace_name: z.string().describe("Name of the namespace to upload to"),
    vectors: z.array(z.object({
      id: z.string().describe("Unique identifier for the vector"),
      vector: z.array(z.number()).describe("Vector values"),
      text: z.string().optional().describe("Optional original text for the vector"),
      metadata: z.record(z.string(), z.any()).optional().describe("Optional metadata for the vector. Will be flattened as top-level fields to match API format."),
    })).describe("Array of vectors to upload"),
  },
  handler: async ({ namespace_name, vectors }) => {
    try {
      const normalizedVectors = vectors.map((vectorItem) => {
        const { metadata, ...rest } = vectorItem;
        return metadata && typeof metadata === 'object'
          ? { ...rest, ...metadata }
          : rest;
      });

      const data = await makeApiRequest('POST', `${API_ENDPOINTS.namespaces}/${namespace_name}/vectors`, {
        vectors: normalizedVectors,
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
};

// Delete data tool
export const deleteDataTool = {
  name: "delete-data",
  description: "Delete specific data items from a namespace in Moorcheh",
  parameters: {
    namespace_name: z.string().describe("Name of the namespace to delete from"),
    data_type: z.enum(["documents", "vectors"]).optional().describe("Data type to delete from. Use 'documents' for text namespaces and 'vectors' for vector namespaces. Default is 'documents'."),
    ids: z.array(z.string()).describe("Array of document/vector IDs to delete"),
  },
  handler: async ({ namespace_name, data_type = "documents", ids }) => {
    try {
      const data = await makeApiRequest('POST', `${API_ENDPOINTS.namespaces}/${namespace_name}/${data_type}/delete`, {
        ids,
      });

      const resultText = `Successfully processed deletion of ${ids.length} ${data_type} item(s) in namespace "${namespace_name}":\n${JSON.stringify(data, null, 2)}`;

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
}; 

// Get data by IDs tool (for text namespaces)
export const getDataTool = {
  name: "get-data",
  description: "Get specific data items by ID from a text namespace in Moorcheh",
  parameters: {
    namespace_name: z.string().describe("Name of the text namespace to read from"),
    ids: z.array(z.string()).describe("Array of document IDs to retrieve"),
  },
  handler: async ({ namespace_name, ids }) => {
    try {
      const data = await makeApiRequest('POST', `${API_ENDPOINTS.namespaces}/${namespace_name}/documents/get`, {
        ids,
      });

      const resultText = `Fetched ${ids.length} item(s) from namespace "${namespace_name}":\n${JSON.stringify(data, null, 2)}`;

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
            text: `Error fetching data: ${error.message}`,
          },
        ],
      };
    }
  },
};

// Fetch text chunks from a text namespace (list / export / RAG)
export const fetchTextDataTool = {
  name: "fetch-text-data",
  description:
    "List text and summary chunks from a text-type namespace via GET /documents/fetch-text-data. Returns up to 100 items per request with statistics (text vs summary counts, source_counts). Only text namespaces are supported; not for vector namespaces. See Moorcheh API docs.",
  parameters: {
    namespace_name: z
      .string()
      .describe("Name of the text namespace (e.g. my-docs). Must be a text-type namespace."),
  },
  handler: async ({ namespace_name }) => {
    try {
      const data = await makeApiRequest(
        "GET",
        `${API_ENDPOINTS.namespaces}/${namespace_name}/documents/fetch-text-data`
      );

      const resultText = `Fetched text data from namespace "${namespace_name}":\n${JSON.stringify(data, null, 2)}`;

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
            text: `Error fetching text data: ${error.message}`,
          },
        ],
      };
    }
  },
};

// Upload file tool
export const uploadFileTool = {
  name: "upload-file",
  description: "Upload a file to a text namespace using pre-signed URL flow. The tool requests an upload URL, uploads the file directly to storage, then the file is queued for processing and indexing.",
  parameters: {
    namespace_name: z.string().describe("Name of the text namespace to upload the file to"),
    file_path: z.string().describe("Absolute path to the file to upload. Must be one of: .pdf, .docx, .xlsx, .json, .txt, .csv, .md"),
  },
  handler: async ({ namespace_name, file_path }) => {
    try {
      const data = await uploadFile(namespace_name, file_path);

      const uploaded_file_name = data.file_name || 'uploaded file';
      const resultText = `Successfully uploaded file "${uploaded_file_name}" to namespace "${namespace_name}":\n${JSON.stringify(data, null, 2)}`;

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
            text: `Error uploading file: ${error.message}`,
          },
        ],
      };
    }
  },
};

// List raw file objects in document storage (S3) for a namespace
export const listFilesTool = {
  name: "list-files",
  description:
    "List file objects stored in document storage (S3) for a namespace: file_name, size (bytes), last_modified. This is raw storage listing (e.g. after upload-url uploads), not indexed text documents. GET only; no body.",
  parameters: {
    namespace_name: z.string().describe("Namespace name. Must exist and belong to your account."),
  },
  handler: async ({ namespace_name }) => {
    try {
      const data = await makeApiRequest(
        "GET",
        `${API_ENDPOINTS.namespaces}/${namespace_name}/list-files`
      );

      const resultText = `Listed files in namespace "${namespace_name}":\n${JSON.stringify(data, null, 2)}`;

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
            text: `Error listing files: ${error.message}`,
          },
        ],
      };
    }
  },
};

// Delete one or more raw files from document storage (S3) for a namespace
export const deleteFileTool = {
  name: "delete-file",
  description:
    "Permanently delete file(s) from document storage (S3) for a namespace. Use snake_case: file_name (one file) and/or file_names (array). At least one is required. This deletes storage objects, not indexed documents by pipeline ID (use delete-data for documents/vectors by id).",
  parameters: {
    namespace_name: z.string().describe("Namespace that contains the file(s). You must own this namespace."),
    file_name: z
      .string()
      .optional()
      .describe('Single file to delete (e.g. "document.pdf"). Can be combined with file_names.'),
    file_names: z
      .array(z.string())
      .optional()
      .describe('Multiple files to delete, e.g. ["a.pdf", "b.docx"]. Can be combined with file_name.'),
  },
  handler: async ({ namespace_name, file_name, file_names }) => {
    try {
      const hasSingle = typeof file_name === "string" && file_name.trim().length > 0;
      const hasMany = Array.isArray(file_names) && file_names.length > 0;

      if (!hasSingle && !hasMany) {
        return {
          content: [
            {
              type: "text",
              text: "Error: Provide file_name and/or file_names with at least one file to delete.",
            },
          ],
        };
      }

      const body = {};
      if (hasSingle) {
        body.file_name = file_name.trim();
      }
      if (hasMany) {
        body.file_names = file_names;
      }

      const data = await makeApiRequest(
        "DELETE",
        `${API_ENDPOINTS.namespaces}/${namespace_name}/delete-file`,
        body
      );

      const resultText = `Delete file result for namespace "${namespace_name}":\n${JSON.stringify(data, null, 2)}`;

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
            text: `Error deleting file(s): ${error.message}`,
          },
        ],
      };
    }
  },
};