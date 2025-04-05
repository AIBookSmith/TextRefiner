import { pgTable, text, serial, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Available writing styles
export const writingStyles = [
  "academic",
  "factual",
  "marketing",
  "fiction",
  "conversational",
  "journalistic",
  "technical"
] as const;

// Formality levels
export const formalityLevels = [
  "informal",
  "neutral",
  "formal"
] as const;

export const textEntries = pgTable("text_entries", {
  id: serial("id").primaryKey(),
  originalText: text("original_text").notNull(),
  humanizedText: text("humanized_text"),
  changes: jsonb("changes").$type<Array<{ original: string; replacement: string }>>(),
  changeCount: integer("change_count"),
  writingStyle: text("writing_style"),
  formalityLevel: text("formality_level"),
});

export const insertTextEntrySchema = createInsertSchema(textEntries)
  .pick({
    originalText: true,
    humanizedText: true,
    changes: true,
    writingStyle: true,
    formalityLevel: true,
  })
  .extend({
    originalText: z.string(),
    humanizedText: z.string().optional(),
    writingStyle: z.string().optional(),
    formalityLevel: z.string().optional(),
  });

export type InsertTextEntry = z.infer<typeof insertTextEntrySchema>;
export type TextEntry = typeof textEntries.$inferSelect;

// OpenAI response schema for humanized text
export const openAIResponseSchema = z.object({
  humanizedText: z.string(),
  changes: z.array(
    z.object({
      original: z.string(),
      replacement: z.string(),
    })
  ),
});

export type OpenAIResponse = z.infer<typeof openAIResponseSchema>;

// Schema for text humanization request
export const humanizeTextSchema = z.object({
  text: z.string().min(1, "Text is required"),
  showChanges: z.boolean().default(true),
  temperature: z.number().min(0).max(1).default(0.7),
  model: z.string().default("mistral"),
  feedbackInstructions: z.string().optional(),
  previousOutputId: z.number().optional(),
  // New fields for language flavor selector
  writingStyle: z.enum(writingStyles).optional(),
  formalityLevel: z.enum(formalityLevels).optional()
});

export type HumanizeTextRequest = z.infer<typeof humanizeTextSchema>;

// Schema for feedback request
export const feedbackSchema = z.object({
  feedback: z.string().min(1, "Feedback is required"),
  outputId: z.number()
});

export type FeedbackRequest = z.infer<typeof feedbackSchema>;

// Tone analysis schema
export const toneAnalysisSchema = z.object({
  text: z.string().min(1, "Text is required"),
});

export type ToneAnalysisRequest = z.infer<typeof toneAnalysisSchema>;

export const toneResultSchema = z.object({
  primaryTone: z.string(),
  tones: z.array(
    z.object({
      tone: z.string(),
      score: z.number().min(0).max(1),
      description: z.string().optional(),
    })
  ),
  overallSentiment: z.object({
    label: z.string(),
    score: z.number().min(-1).max(1),
  }),
  language: z.string().optional(),
  formality: z.object({
    level: z.string(),
    score: z.number().min(0).max(1),
  }),
  readabilityScore: z.number().optional(),
});

export type ToneAnalysisResult = z.infer<typeof toneResultSchema>;

// Writing tips schemas
export const writingTipSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  example: z.string().optional(),
  textSelection: z.object({
    start: z.number(),
    end: z.number(),
  }).optional(),
  suggestedChange: z.string().optional(),
});

export const writingTipsRequestSchema = z.object({
  text: z.string(),
  writingStyle: z.enum(writingStyles),
  formalityLevel: z.enum(formalityLevels),
});

export const writingTipsResponseSchema = z.object({
  tips: z.array(writingTipSchema),
  originalText: z.string(),
});

export type WritingTip = z.infer<typeof writingTipSchema>;
export type WritingTipsRequest = z.infer<typeof writingTipsRequestSchema>;
export type WritingTipsResponse = z.infer<typeof writingTipsResponseSchema>;
