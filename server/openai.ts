import OpenAI from "openai";
import { OpenAIResponse } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function humanizeText(text: string, temperature: number = 0.7, model: string = "gpt-4o"): Promise<OpenAIResponse> {
  try {
    const response = await openai.chat.completions.create({
      model,
      temperature,
      messages: [
        {
          role: "system",
          content: 
            "You are an expert at identifying and improving AI-generated text to make it sound more human and natural. " +
            "You can identify common patterns that make text sound artificial, such as:" +
            "1. Overly formal language and phrases (e.g., 'It is worth noting that', 'shall be examining', etc.)" +
            "2. Excessive hedging ('may potentially', 'could possibly', etc.)" +
            "3. Repetitive sentence structures" +
            "4. Overly complex transitions" +
            "5. Lack of contractions and conversational tone" +
            "Your task is to rewrite the provided text to sound more human and natural, while maintaining the original meaning and content." +
            "Respond with a JSON object containing two fields: 'humanizedText' with the improved text and 'changes' which is an array of objects with 'original' and 'replacement' fields describing each significant change you made."
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content) as OpenAIResponse;
    return result;
  } catch (error: any) {
    console.error("Error calling OpenAI API:", error.message);
    throw new Error(`Failed to process text with OpenAI: ${error.message}`);
  }
}
