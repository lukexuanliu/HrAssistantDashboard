import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertFileSchema, insertChatMessageSchema, ChatMessageType } from "@shared/schema";
import axios from "axios";

// Configure multer for file storage
const uploadDir = path.join(process.cwd(), 'uploads');

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage_config = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    // Create a unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to only accept CSV, JSON, and PDF files
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedFileTypes = ['.csv', '.json', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV, JSON, and PDF files are allowed'));
  }
};

// Create the multer upload instance
const upload = multer({ 
  storage: storage_config,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // File upload route
  app.post('/api/files/upload', upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fileType = path.extname(req.file.originalname).replace('.', '').toLowerCase();
      
      // Save file metadata to storage
      const fileData = insertFileSchema.parse({
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileType: fileType,
        size: req.file.size
      });

      const savedFile = await storage.createFile(fileData);
      
      res.status(201).json(savedFile);
    } catch (error) {
      console.error('File upload error:', error);
      
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // Get all files
  app.get('/api/files', async (_req: Request, res: Response) => {
    try {
      const files = await storage.getAllFiles();
      res.json(files);
    } catch (error) {
      console.error('Error fetching files:', error);
      res.status(500).json({ error: 'Failed to fetch files' });
    }
  });

  // Delete a file
  app.delete('/api/files/:id', async (req: Request, res: Response) => {
    try {
      const fileId = parseInt(req.params.id);
      
      if (isNaN(fileId)) {
        return res.status(400).json({ error: 'Invalid file ID' });
      }
      
      const file = await storage.getFile(fileId);
      
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      // Delete the file from disk
      const filePath = path.join(uploadDir, file.filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Delete from storage
      await storage.deleteFile(fileId);
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  });

  // Get all chat messages
  app.get('/api/chat/messages', async (_req: Request, res: Response) => {
    try {
      const messages = await storage.getAllChatMessages();
      res.json(messages);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      res.status(500).json({ error: 'Failed to fetch chat messages' });
    }
  });

  // Send a message to Hugging Face and get a response
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required and must be a string' });
      }

      console.log('Received chat message:', message);
      
      // Create a user message in storage
      const userMessage = insertChatMessageSchema.parse({
        role: 'user',
        content: message
      });
      
      await storage.createChatMessage(userMessage);
      
      // Prepare the prompt for the HR assistant
      const prompt = `As an HR assistant, please answer this question: ${message}`;
      
      // Get the HuggingFace API token from environment variables
      const hfToken = process.env.HUGGINGFACE_API_TOKEN;
      
      if (!hfToken) {
        console.error('HUGGINGFACE_API_TOKEN is not set in environment variables');
        return res.status(500).json({ 
          error: 'HuggingFace API token is not configured',
          message: 'The server is not properly configured to use the HuggingFace API.'
        });
      }

      console.log('Sending request to HuggingFace API...');
      
      // Call the Hugging Face API
      const apiUrl = 'https://api-inference.huggingface.co/models/distilgpt2';
      const requestData = {
        inputs: prompt,
        parameters: {
          max_length: 200,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true
        }
      };
      
      // Log the raw API request for debugging
      console.log('Raw API request:', JSON.stringify(requestData, null, 2));
      
      const response = await axios.post(apiUrl, requestData, {
        headers: {
          'Authorization': `Bearer ${hfToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Log the raw API response for debugging
      console.log('Raw API response:', JSON.stringify(response.data, null, 2));
      
      // Process the response
      let assistantResponse = '';
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        assistantResponse = response.data[0].generated_text || '';
      } else if (response.data && response.data.generated_text) {
        assistantResponse = response.data.generated_text;
      } else {
        assistantResponse = 'I apologize, but I could not generate a response at this time.';
      }
      
      // Clean up the response from the model
      // First, remove the original prompt
      if (assistantResponse.startsWith(prompt)) {
        assistantResponse = assistantResponse.substring(prompt.length).trim();
      }
      
      // Clean up common patterns in distilgpt2 responses
      // Remove multiple consecutive newlines
      assistantResponse = assistantResponse.replace(/\n{2,}/g, '\n\n');
      
      // If the response is empty or just whitespace after cleaning, provide a fallback
      if (!assistantResponse.trim()) {
        assistantResponse = "I understand your question. As an HR assistant, I'll do my best to help with your inquiry.";
      }
      
      // Limit response length to avoid extremely long outputs
      if (assistantResponse.length > 500) {
        assistantResponse = assistantResponse.substring(0, 500) + "...";
      }
      
      // Create an assistant message in storage
      const assistantMessage = insertChatMessageSchema.parse({
        role: 'assistant',
        content: assistantResponse
      });
      
      const savedAssistantMessage = await storage.createChatMessage(assistantMessage);
      
      // Return successful response with the assistant's message
      res.status(200).json({
        message: savedAssistantMessage,
        raw_response: response.data,
        success: true,
        generated_text: assistantResponse,
        model: 'distilgpt2'
      });
      
    } catch (error: any) {
      console.error('Chat API error:', error);
      
      // Detailed error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('API Error Response Data:', error.response.data);
        console.error('API Error Response Status:', error.response.status);
        console.error('API Error Response Headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('API Error Request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('API Error Message:', error.message);
      }
      
      if (error instanceof Error) {
        res.status(500).json({ 
          error: error.message,
          success: false
        });
      } else {
        res.status(500).json({ 
          error: 'An unknown error occurred',
          success: false
        });
      }
    }
  });
  
  const httpServer = createServer(app);

  return httpServer;
}
