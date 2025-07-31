import { z } from 'zod';
import { makeApiRequest, API_ENDPOINTS } from '../config/api.js';

// Upload text documents tool
export const uploadTextTool = {
  name: "upload-text",
  description: "Upload text documents to a namespace in Moorcheh",
  parameters: {
    namespace_name: z.string().describe("Name of the namespace to upload to"),
    documents: z.array(z.object({
      id: z.string().describe("Unique identifier for the document"),
      text: z.string().describe("Text content of the document"),
      metadata: z.record(z.string(), z.any()).optional().describe("Optional metadata for the document"),
    })).describe("Array of documents to upload"),
  },
  handler: async ({ namespace_name, documents }) => {
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
      metadata: z.record(z.string(), z.any()).optional().describe("Optional metadata for the vector"),
    })).describe("Array of vectors to upload"),
  },
  handler: async ({ namespace_name, vectors }) => {
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
};

// Delete data tool
export const deleteDataTool = {
  name: "delete-data",
  description: "Delete specific data items from a namespace in Moorcheh",
  parameters: {
    namespace_name: z.string().describe("Name of the namespace to delete from"),
    ids: z.array(z.string()).describe("Array of document/vector IDs to delete"),
  },
  handler: async ({ namespace_name, ids }) => {
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
}; 