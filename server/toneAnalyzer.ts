import { Mistral } from '@mistralai/mistralai';
import { ToneAnalysisResult } from "@shared/schema";

// Function to get Mistral client - reusing the same client setup as in mistral.ts
function getMistralClient(): any {
  if (!process.env.MISTRAL_API_KEY) {
    throw new Error("MISTRAL_API_KEY environment variable is not set");
  }
  return new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
}

export async function analyzeTone(text: string): Promise<ToneAnalysisResult> {
  try {
    const client = getMistralClient();
    
    // Using Mistral's most capable model for tone analysis
    const modelName = "mistral-large-latest";
    
    const response = await client.chat.complete({
      model: modelName,
      temperature: 0.3, // Lower temperature for more consistent analysis
      messages: [
        {
          role: "system",
          content: 
            "You are an expert linguistic analyst specializing in tone, sentiment, and emotional analysis of text. " +
            "Analyze the text for its emotional tone, formality level, primary sentiment, and overall characteristics. " +
            "Your analysis should cover:" +
            "1. The primary emotional tone (e.g., joyful, angry, neutral, anxious, confident)" +
            "2. A breakdown of emotional tones present with a score between 0-1 for each" +
            "3. Overall sentiment (positive, negative, or neutral) with a score between -1 and 1" +
            "4. Formality level (very formal, formal, neutral, casual, very casual) with a score between 0-1" +
            "5. The language of the text if identifiable" +
            "6. An estimated readability score if relevant" +
            "Respond with ONLY a valid JSON object following this structure exactly: " +
            "{\n" +
            "  \"primaryTone\": \"string\",\n" +
            "  \"tones\": [\n" +
            "    {\n" +
            "      \"tone\": \"string\",\n" +
            "      \"score\": number,\n" +
            "      \"description\": \"string\"\n" +
            "    }\n" +
            "  ],\n" +
            "  \"overallSentiment\": {\n" +
            "    \"label\": \"string\",\n" +
            "    \"score\": number\n" +
            "  },\n" +
            "  \"language\": \"string\",\n" +
            "  \"formality\": {\n" +
            "    \"level\": \"string\",\n" +
            "    \"score\": number\n" +
            "  },\n" +
            "  \"readabilityScore\": number\n" +
            "}"
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the JSON response
    const content = response.choices[0].message.content || "{}";
    
    try {
      // Clean any potential code blocks, extra spaces or newlines
      let cleanContent = content;
      
      // Check if the content is wrapped in code blocks and extract just the JSON part
      const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonBlockMatch && jsonBlockMatch[1]) {
        cleanContent = jsonBlockMatch[1];
      }
      
      // Try to parse the cleaned content
      const result = JSON.parse(cleanContent) as ToneAnalysisResult;
      return result;
    } catch (parseError) {
      console.error("Failed to parse Tone Analysis response as JSON:", parseError);
      
      // Try an alternative approach - look for JSON-like structures
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const potentialJson = jsonMatch[0];
          const result = JSON.parse(potentialJson) as ToneAnalysisResult;
          return result;
        }
      } catch (secondError) {
        console.error("Second parsing attempt failed:", secondError);
      }
      
      // Fallback: Return a simplified response
      return {
        primaryTone: "Neutral",
        tones: [
          {
            tone: "Neutral",
            score: 1.0,
            description: "Unable to analyze specific tones"
          }
        ],
        overallSentiment: {
          label: "Neutral",
          score: 0
        },
        formality: {
          level: "Neutral",
          score: 0.5
        }
      };
    }
  } catch (error: any) {
    console.error("Error calling Mistral AI for tone analysis:", error.message);
    throw new Error(`Failed to analyze tone with Mistral AI: ${error.message}`);
  }
}