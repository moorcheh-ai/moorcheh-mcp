import axios from 'axios';
import { readFileSync, createReadStream, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, basename } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file silently without dotenv
try {
  const envPath = join(__dirname, '../../../.env');
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
const MOORCHEH_API_KEY = process.env.MOORCHEH_API_KEY;

if (!MOORCHEH_API_KEY) {
  console.error('Missing required API_KEY environment variable');
  console.error('Please create a .env file in this directory with: MOORCHEH_API_KEY=your_actual_api_key');
  process.exit(1);
}

// Debug: Check if API key looks valid (don't log the full key for security)
if (MOORCHEH_API_KEY === 'your_api_key_here' || MOORCHEH_API_KEY.length < 10) {
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
        'x-api-key': MOORCHEH_API_KEY,
        'Content-Type': 'application/json',
      },
    };
    
    if (data) {
      config.data = data;
    }
    
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

// Helper function to upload files using pre-signed S3 URL flow
async function uploadFile(namespace_name, filePath) {
  try {
    // Check if file exists
    const stats = statSync(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    
    // Check file extension
    const allowedExtensions = ['.pdf', '.docx', '.xlsx', '.json', '.txt', '.csv', '.md'];
    const fileExtension = filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error(`File type '${fileExtension}' is not supported. Allowed types: ${allowedExtensions.join(', ')}`);
    }

    const file_name = basename(filePath);
    const uploadUrlPayload = await makeApiRequest(
      'POST',
      `${API_ENDPOINTS.namespaces}/${namespace_name}/upload-url`,
      { file_name }
    );

    if (!uploadUrlPayload?.upload_url || !uploadUrlPayload?.content_type) {
      throw new Error(`Invalid upload URL response: ${JSON.stringify(uploadUrlPayload)}`);
    }

    await axios.put(uploadUrlPayload.upload_url, createReadStream(filePath), {
      headers: {
        'Content-Type': uploadUrlPayload.content_type,
        'Content-Length': stats.size,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return {
      status: 'success',
      namespace_name,
      file_name,
      file_size_mb: Number(fileSizeInMB.toFixed(2)),
      key: uploadUrlPayload.key,
      content_type: uploadUrlPayload.content_type,
      expires_in: uploadUrlPayload.expires_in,
      message: 'File uploaded to storage successfully and queued for processing.',
    };
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
    throw new Error(`File upload error: ${error.message}`);
  }
}

export { API_ENDPOINTS, makeApiRequest, uploadFile, MOORCHEH_API_KEY }; 