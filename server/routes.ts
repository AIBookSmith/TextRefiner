import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { humanizeText as humanizeTextWithOpenAI } from "./openai";
import { humanizeText as humanizeTextWithMistral, generateWritingTips } from "./mistral";
import { analyzeTone } from "./toneAnalyzer";
import { ZodError } from "zod";
import { 
  humanizeTextSchema, 
  insertTextEntrySchema, 
  OpenAIResponse,
  feedbackSchema,
  toneAnalysisSchema,
  writingTipsRequestSchema,
  WritingTipsResponse
} from "@shared/schema";

// Function to choose between OpenAI and Mistral based on model parameter
async function humanizeText(
  text: string, 
  temperature: number = 0.7, 
  model: string = "mistral", 
  writingStyle?: string | null,
  formalityLevel?: string | null,
  feedbackInstructions?: string
): Promise<OpenAIResponse> {
  // If feedback instructions are provided, add them to the text
  let processedText = text;
  
  if (feedbackInstructions) {
    // Add the feedback instructions to guide the AI in its revision
    processedText = `${text}\n\nPlease revise this text based on the following feedback: ${feedbackInstructions}`;
  }
  
  // Default to Mistral
  if (!model || model === "mistral") {
    return humanizeTextWithMistral(processedText, temperature, writingStyle, formalityLevel);
  } else {
    // Fall back to OpenAI if explicitly requested
    // Note: OpenAI implementation currently doesn't support writing style and formality level
    return humanizeTextWithOpenAI(processedText, temperature, model);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to humanize text
  app.post("/api/humanize", async (req, res) => {
    try {
      // Validate request body
      const validatedData = humanizeTextSchema.parse(req.body);
      
      // If no text provided, return error
      if (!validatedData.text || validatedData.text.trim() === "") {
        return res.status(400).json({ message: "Text is required" });
      }

      let originalText = validatedData.text;
      let previousEntry;
      
      // If we have a previous output ID and feedback instructions, get the previous entry
      if (validatedData.previousOutputId && validatedData.feedbackInstructions) {
        try {
          previousEntry = await storage.getTextEntryById(validatedData.previousOutputId);
          if (previousEntry && previousEntry.humanizedText) {
            // Use the humanized text from the previous entry as our new input
            originalText = previousEntry.humanizedText;
            console.log(`Using previous output (ID: ${validatedData.previousOutputId}) as input for revision`);
          }
        } catch (err) {
          console.error("Error retrieving previous entry:", err);
        }
      }
      
      // Process the text with Mistral AI (default) or OpenAI
      const result = await humanizeText(
        originalText, 
        validatedData.temperature, 
        validatedData.model,
        validatedData.writingStyle,
        validatedData.formalityLevel,
        validatedData.feedbackInstructions
      );

      // Save the result to storage
      const entry = await storage.saveTextEntry({
        originalText: validatedData.text,
        humanizedText: result.humanizedText,
        changes: result.changes,
        writingStyle: validatedData.writingStyle,
        formalityLevel: validatedData.formalityLevel
      });

      // Return the result
      return res.status(200).json({
        id: entry.id,
        originalText: entry.originalText,
        humanizedText: entry.humanizedText,
        changes: entry.changes || [],
        changeCount: entry.changeCount || 0,
        showChanges: validatedData.showChanges,
        writingStyle: entry.writingStyle,
        formalityLevel: entry.formalityLevel
      });
    } catch (error) {
      console.error("Error in humanize text endpoint:", error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: error.errors 
        });
      }
      
      // Check if it's an AI API error
      if (error instanceof Error) {
        // Special handling for API key errors
        if (error.message.includes("API key") || error.message.includes("401")) {
          const service = error.message.includes("MISTRAL_API_KEY") ? "Mistral AI" : "OpenAI";
          return res.status(500).json({
            message: `${service} API key error`,
            error: `The application couldn't authenticate with ${service}. Please check that a valid API key has been provided.`
          });
        }
        // Other AI service errors
        else if (error.message.includes("OpenAI") || error.message.includes("Mistral")) {
          return res.status(500).json({ 
            message: "Error communicating with AI service", 
            error: error.message
          });
        }
      }

      return res.status(500).json({ message: "An unexpected error occurred" });
    }
  });

  // Get recent text entries (for history feature if needed later)
  app.get("/api/text-entries/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const entries = await storage.getRecentTextEntries(limit);
      return res.status(200).json(entries);
    } catch (error) {
      console.error("Error getting recent text entries:", error);
      return res.status(500).json({ message: "Failed to fetch recent entries" });
    }
  });
  
  // Endpoint for tone analysis
  app.post("/api/analyze-tone", async (req, res) => {
    try {
      // Validate request body
      const validatedData = toneAnalysisSchema.parse(req.body);
      
      if (!validatedData.text || validatedData.text.trim() === "") {
        return res.status(400).json({ message: "Text is required for tone analysis" });
      }
      
      // Analyze the tone of the text
      const result = await analyzeTone(validatedData.text);
      
      // Return the analysis result
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in tone analysis endpoint:", error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: error.errors 
        });
      }
      
      // Check if it's an API key error
      if (error instanceof Error) {
        if (error.message.includes("API key") || error.message.includes("401")) {
          return res.status(500).json({
            message: "Mistral AI API key error",
            error: "The application couldn't authenticate with Mistral AI. Please check that a valid API key has been provided."
          });
        }
      }
      
      return res.status(500).json({ 
        message: "Failed to analyze tone", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Endpoint to handle feedback on humanized text
  app.post("/api/feedback", async (req, res) => {
    try {
      // Validate request body using schema
      const validatedData = feedbackSchema.parse(req.body);
      const { feedback, outputId } = validatedData;
      
      // Get the original text entry
      const entry = await storage.getTextEntryById(outputId);
      
      if (!entry) {
        return res.status(404).json({ message: "Text entry not found" });
      }
      
      // Process the text with feedback instructions
      const result = await humanizeText(
        entry.humanizedText || "", // Use the previously humanized text as input, fallback to empty string if null
        0.7, // Default temperature for feedback processing
        "mistral", // Default to Mistral for feedback processing
        undefined, // No specific writing style for feedback
        undefined, // No specific formality level for feedback
        feedback // Pass the feedback as instructions
      );
      
      // Save the revised version
      const revisedEntry = await storage.saveTextEntry({
        originalText: entry.humanizedText || "", // Previous output becomes new input
        humanizedText: result.humanizedText,
        changes: result.changes,
      });
      
      // Return the revised result
      return res.status(200).json({
        id: revisedEntry.id,
        originalText: revisedEntry.originalText,
        humanizedText: revisedEntry.humanizedText,
        changes: revisedEntry.changes || [],
        changeCount: revisedEntry.changes?.length || 0,
        feedback: feedback
      });
    } catch (error) {
      console.error("Error processing feedback:", error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: error.errors 
        });
      }
      
      // Check if it's an AI API error
      if (error instanceof Error) {
        // Special handling for API key errors
        if (error.message.includes("API key") || error.message.includes("401")) {
          const service = error.message.includes("MISTRAL_API_KEY") ? "Mistral AI" : "OpenAI";
          return res.status(500).json({
            message: `${service} API key error`,
            error: `The application couldn't authenticate with ${service}. Please check that a valid API key has been provided.`
          });
        }
      }
      
      return res.status(500).json({ message: "Failed to process feedback" });
    }
  });

  // Endpoint to get writing tips for the provided text
  app.post("/api/writing-tips", async (req, res) => {
    try {
      // Validate request body
      const validatedData = writingTipsRequestSchema.parse(req.body);
      
      if (!validatedData.text || validatedData.text.trim() === "") {
        return res.status(400).json({ message: "Text is required for writing tips" });
      }
      
      // Generate writing tips based on the text
      const result = await generateWritingTips(
        validatedData.text,
        validatedData.writingStyle,
        validatedData.formalityLevel
      );
      
      // Return the result
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error generating writing tips:", error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: error.errors 
        });
      }
      
      // Check if it's an API key error
      if (error instanceof Error) {
        if (error.message.includes("API key") || error.message.includes("401")) {
          return res.status(500).json({
            message: "Mistral AI API key error",
            error: "The application couldn't authenticate with Mistral AI. Please check that a valid API key has been provided."
          });
        }
      }
      
      return res.status(500).json({ 
        message: "Failed to generate writing tips", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
