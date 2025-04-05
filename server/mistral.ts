import { Mistral } from '@mistralai/mistralai';
import { OpenAIResponse, WritingTip, WritingTipsResponse } from "@shared/schema";

// Initialize Mistral client
let mistralClient: any = null;

// Function to get Mistral client - will be initialized when API key is provided
function getMistralClient(): any {
  if (!mistralClient) {
    if (!process.env.MISTRAL_API_KEY) {
      throw new Error("MISTRAL_API_KEY environment variable is not set");
    }
    mistralClient = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
  }
  return mistralClient;
}

export async function generateWritingTips(
  text: string,
  writingStyle?: string | null,
  formalityLevel?: string | null
): Promise<WritingTipsResponse> {
  try {
    const client = getMistralClient();
    
    // Using Mistral's most capable model
    const modelName = "mistral-large-latest";

    let systemInstruction = 
      "You are an expert writing coach who gives specific, helpful suggestions to improve text. " +
      "Given a text that has already been refined once, your task is to provide 3-4 specific writing tips that would further improve the text. " +
      "Each tip should focus on a specific aspect of the writing that could be enhanced, with concrete examples from the text. " +
      "When appropriate, include a suggested change for each tip. " +
      "Make sure the tips are appropriate for the writing style and formality level specified. " +
      "IMPORTANT: Always keep the tips and suggestions in the same language as the original text. NEVER translate the text to another language or provide suggestions in a different language than the input text. ";

    // Add style and formality context
    if (writingStyle) {
      systemInstruction += `The text is written in a ${writingStyle} style. `;
    }
    
    if (formalityLevel) {
      systemInstruction += `The desired formality level is ${formalityLevel}. `;
    }

    // Add instructions for the response format
    systemInstruction +=
      "For each tip, provide: " +
      "1. A clear title describing the issue (e.g., 'Vary Sentence Length') " +
      "2. A helpful explanation of why this improvement matters " +
      "3. When possible, an example from the text showing the issue " +
      "4. A specific suggestion for how to improve it " +
      "5. When possible, the character position (start and end index) where the issue appears in the text " +
      "6. A suggested replacement text for that section " +
      "Remember to analyze the language of the input and respond in the SAME LANGUAGE as the input text. " +
      "You MUST respond with a valid JSON object that has a 'tips' array containing objects with 'id', 'title', 'description', 'example' (optional), " +
      "'textSelection' (with 'start' and 'end' indices, optional), and 'suggestedChange' (optional) fields. " +
      "Also include an 'originalText' field containing the exact text that was analyzed.";

    const response = await client.chat.complete({
      model: modelName,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: systemInstruction
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
      // Clean any potential code blocks or formatting
      let cleanContent = content;
      
      // Check if the content is wrapped in code blocks and extract just the JSON part
      const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonBlockMatch && jsonBlockMatch[1]) {
        cleanContent = jsonBlockMatch[1];
      }
      
      // Try to parse the cleaned content
      const result = JSON.parse(cleanContent) as WritingTipsResponse;
      
      // Ensure we have the original text in the response
      if (!result.originalText) {
        result.originalText = text;
      }
      
      // Generate IDs for tips if they don't have them
      result.tips = result.tips.map((tip, index) => {
        if (!tip.id) {
          return { ...tip, id: `tip-${index + 1}` };
        }
        return tip;
      });
      
      return result;
    } catch (parseError) {
      console.error("Failed to parse writing tips response as JSON:", parseError);
      
      // Fallback response with a generic tip
      return {
        tips: [
          {
            id: "error-tip-1",
            title: "Review Your Text",
            description: "There may be opportunities to improve the flow and structure of your text.",
            example: "Consider reviewing your text for clarity and coherence."
          }
        ],
        originalText: text
      };
    }
  } catch (error: any) {
    console.error("Error generating writing tips:", error.message);
    throw new Error(`Failed to generate writing tips: ${error.message}`);
  }
}

export async function humanizeText(
  text: string, 
  temperature: number = 0.7, 
  writingStyle?: string | null,
  formalityLevel?: string | null
): Promise<OpenAIResponse> {
  try {
    const client = getMistralClient();
    
    // Using Mistral's most capable model - adjust as needed
    const modelName = "mistral-large-latest";

    // Base instruction
    let systemInstruction = 
      "You are an expert at identifying and improving AI-generated text to make it sound more human and natural in any language. " +
      "You can identify common patterns that make text sound artificial, such as:" +
      "1. Overly formal language and phrases " +
      "2. Excessive hedging expressions " +
      "3. Repetitive sentence structures " +
      "4. Overly complex transitions " +
      "5. Lack of contractions and conversational tone " +
      "6. Unusual word choice for the language " +
      "7. Unnatural phrases that don't sound like a native speaker ";

    // Style-specific instructions
    if (writingStyle) {
      switch(writingStyle) {
        case "academic":
          systemInstruction += "Rewrite the text in an academic style, using precise vocabulary, complex sentence structures, and a formal tone. " +
            "Include topic sentences, logical transitions, and appropriate academic phrases, but avoid the kind of repetitive patterns and structures typical of AI writing. " +
            "Maintain an authoritative, scholarly voice without sounding robotic. ";
          break;
        case "factual":
          systemInstruction += "Rewrite the text in a factual book style, using clear explanations, accessible vocabulary, and a balance between informative and engaging language. " +
            "Include concrete examples, analogies when helpful, and a logical progression of ideas. " +
            "Maintain a trustworthy, educational voice that's more approachable than academic writing but still authoritative. ";
          break;
        case "marketing":
          systemInstruction += "Rewrite the text in a persuasive marketing style, using engaging vocabulary, varied sentence structures, and an enthusiastic tone. " +
            "Include benefit-focused language, emotional appeals, and calls to action. " +
            "Maintain a compelling, persuasive voice that feels authentic rather than pushy. ";
          break;
        case "fiction":
          systemInstruction += "Rewrite the text in a literary style appropriate for fiction, using vivid descriptions, varied sentence rhythms, and emotion-evoking language. " +
            "Include sensory details, character perspectives when relevant, and narrative flow. " +
            "Maintain a creative, engaging voice with a show-don't-tell approach. ";
          break;
        case "conversational":
          systemInstruction += "Rewrite the text in a conversational style, using natural vocabulary, varied sentence structures including fragments, and a relaxed tone. " +
            "Include contractions, personal pronouns, rhetorical questions, and occasional colloquialisms. " +
            "Maintain a friendly, approachable voice that sounds like a real person speaking. ";
          break;
        case "journalistic":
          systemInstruction += "Rewrite the text in a journalistic style, using clear, concise language, varied sentence structures, and an objective tone. " +
            "Include important facts early, concrete details, and contextual information. " +
            "Maintain a credible, informative voice that prioritizes clarity and accuracy. ";
          break;
        case "technical":
          systemInstruction += "Rewrite the text in a technical style, using precise terminology, clear sentence structures, and a straightforward tone. " +
            "Include specific details, logical organization, and appropriate technical vocabulary. " +
            "Maintain an accurate, instructive voice that experts would recognize as knowledgeable without unnecessary jargon. ";
          break;
      }
    }

    // Formality-level specific instructions
    if (formalityLevel) {
      switch(formalityLevel) {
        case "formal":
          systemInstruction += "Use a formal tone with proper grammar, avoid contractions, slang or colloquialisms. " +
            "Employ sophisticated vocabulary appropriate to educated readers while maintaining clarity. ";
          break;
        case "neutral":
          systemInstruction += "Use a balanced, neutral tone that is neither too formal nor too casual. " +
            "Employ standard grammar with occasional contractions and accessible vocabulary. ";
          break;
        case "informal":
          systemInstruction += "Use a casual, conversational tone with contractions, simpler sentence structures, and approachable language. " +
            "Include occasional colloquialisms where natural, and write as if speaking directly to the reader. ";
          break;
      }
    }

    // Final general instructions
    systemInstruction += 
      "Your task is to rewrite the provided text to sound more human and natural, while maintaining the original meaning and content. " +
      "Analyze the language of the input and respond in the SAME LANGUAGE as the input text. " +
      "You MUST respond with only a valid JSON object containing two fields: 'humanizedText' with the improved text and 'changes' which is an array of objects with 'original' and 'replacement' fields describing each significant change you made. " +
      "Do not include any markdown formatting, code blocks, or explanation text outside the JSON object.";

    const response = await client.chat.complete({
      model: modelName,
      temperature: temperature,
      messages: [
        {
          role: "system",
          content: systemInstruction
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
      // Clean any potential code blocks, extra spaces or newlines that might interfere with parsing
      let cleanContent = content;
      
      // Check if the content is wrapped in code blocks and extract just the JSON part
      const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonBlockMatch && jsonBlockMatch[1]) {
        cleanContent = jsonBlockMatch[1];
        console.log("Extracted JSON from code block");
      }
      
      // Try to parse the cleaned content
      const result = JSON.parse(cleanContent) as OpenAIResponse;
      return result;
    } catch (parseError) {
      // If JSON parsing fails, try to extract useful information from the response
      console.error("Failed to parse Mistral response as JSON:", parseError);
      console.log("Raw content:", content);
      
      // Try an alternative approach - look for JSON-like structures
      try {
        // Look for an object-like structure in the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const potentialJson = jsonMatch[0];
          console.log("Found potential JSON structure, trying to parse it");
          const result = JSON.parse(potentialJson) as OpenAIResponse;
          return result;
        }
      } catch (secondError) {
        console.error("Second parsing attempt failed:", secondError);
      }
      
      // Fallback: Return a simplified response
      return {
        humanizedText: content, // Use the raw content as humanized text
        changes: [{ // Create a single change entry
          original: text,
          replacement: content
        }]
      };
    }
  } catch (error: any) {
    console.error("Error calling Mistral AI API:", error.message);
    throw new Error(`Failed to process text with Mistral AI: ${error.message}`);
  }
}