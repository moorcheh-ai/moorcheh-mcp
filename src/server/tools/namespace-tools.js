import { z } from 'zod';
import { makeApiRequest, API_ENDPOINTS } from '../config/api.js';

// Namespace listing tool
export const listNamespacesTool = {
  name: "list-namespaces",
  description: "List all available namespaces in Moorcheh",
  parameters: {},
  handler: async () => {
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
};

// Create namespace tool
export const createNamespaceTool = {
  name: "create-namespace",
  description: "Create a new namespace for document storage in Moorcheh",
  parameters: {
    namespace_name: z.string().describe("Name of the namespace to create"),
    type: z.string().optional().describe("Type of namespace (text, vector, etc.)"),
    vector_dimension: z.number().optional().describe("Vector dimension for vector namespaces"),
  },
  handler: async ({ namespace_name, type = "text", vector_dimension }) => {
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
};

// Delete namespace tool
export const deleteNamespaceTool = {
  name: "delete-namespace",
  description: "Delete a namespace and all its contents from Moorcheh",
  parameters: {
    namespace_name: z.string().describe("Name of the namespace to delete"),
  },
  handler: async ({ namespace_name }) => {
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
}; 