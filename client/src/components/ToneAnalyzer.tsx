import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, AlertCircle, Info, Thermometer, BookOpen, MessageSquare, Lightbulb, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getQueryFn } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';

interface ToneAnalysisScore {
  tone: string;
  score: number;
  description?: string;
}

interface ToneAnalysisResult {
  primaryTone: string;
  tones: ToneAnalysisScore[];
  overallSentiment: {
    label: string;
    score: number;
  };
  language?: string;
  formality: {
    level: string;
    score: number;
  };
  readabilityScore?: number;
}

interface ToneAnalyzerProps {
  originalText: string | null;
  humanizedText: string | null;
}

export default function ToneAnalyzer({ originalText, humanizedText }: ToneAnalyzerProps) {
  const [activeTab, setActiveTab] = useState<string>("original");
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
  const [originalAnalysis, setOriginalAnalysis] = useState<ToneAnalysisResult | null>(null);
  const [humanizedAnalysis, setHumanizedAnalysis] = useState<ToneAnalysisResult | null>(null);
  
  const { toast } = useToast();
  
  // Mutation for analyzing text tone
  const analyzeToneMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await fetch('/api/analyze-tone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to analyze tone');
      }
      
      return response.json() as Promise<ToneAnalysisResult>;
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze text tone",
        variant: "destructive",
      });
    },
  });
  
  const handleAnalyze = async () => {
    if (!originalText && !humanizedText) {
      toast({
        title: "No Text Available",
        description: "Please enter text to analyze",
        variant: "destructive",
      });
      return;
    }
    
    setShowAnalysis(true);
    
    // Analyze original text
    if (originalText) {
      try {
        const result = await analyzeToneMutation.mutateAsync(originalText);
        setOriginalAnalysis(result);
      } catch (error) {
        console.error("Error analyzing original text:", error);
      }
    }
    
    // Analyze humanized text
    if (humanizedText) {
      try {
        const result = await analyzeToneMutation.mutateAsync(humanizedText);
        setHumanizedAnalysis(result);
      } catch (error) {
        console.error("Error analyzing humanized text:", error);
      }
    }
  };
  
  const getSentimentColor = (score: number) => {
    if (score >= 0.6) return "text-green-500";
    if (score >= 0.2) return "text-green-400";
    if (score > -0.2) return "text-gray-500";
    if (score > -0.6) return "text-red-400";
    return "text-red-500";
  };
  
  const getFormalityLabel = (level: string) => {
    switch (level.toLowerCase()) {
      case "very formal": return "bg-indigo-100 text-indigo-800";
      case "formal": return "bg-blue-100 text-blue-800";
      case "neutral": return "bg-gray-100 text-gray-800";
      case "casual": return "bg-amber-100 text-amber-800";
      case "very casual": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const renderAnalysisContent = (analysis: ToneAnalysisResult | null, isLoading: boolean) => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-center text-muted-foreground">Analyzing text tone...</p>
        </div>
      );
    }
    
    if (!analysis) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <AlertCircle className="w-8 h-8 text-muted-foreground mb-4" />
          <p className="text-center text-muted-foreground">No analysis available</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {/* Primary Tone Section */}
        <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
          <div className="flex items-center mb-2">
            <Thermometer className="w-5 h-5 text-primary mr-2" />
            <h3 className="font-medium">Primary Tone</h3>
          </div>
          <div className="flex items-center justify-center py-3">
            <Badge className="text-lg px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary-foreground">
              {analysis.primaryTone}
            </Badge>
          </div>
        </div>
        
        {/* Tones Section */}
        <div>
          <div className="flex items-center mb-3">
            <MessageSquare className="w-5 h-5 text-primary mr-2" />
            <h3 className="font-medium">Emotional Tones</h3>
          </div>
          <div className="space-y-3">
            {analysis.tones.map((tone, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{tone.tone}</span>
                  <span className="text-sm text-muted-foreground">{Math.round(tone.score * 100)}%</span>
                </div>
                <Progress value={tone.score * 100} className="h-2" />
                {tone.description && (
                  <p className="text-xs text-muted-foreground mt-1">{tone.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Sentiment & Formality */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center mb-2">
              <Lightbulb className="w-5 h-5 text-primary mr-2" />
              <h3 className="font-medium">Sentiment</h3>
            </div>
            <div className="flex items-center justify-center py-2">
              <span className={`text-lg font-medium ${getSentimentColor(analysis.overallSentiment.score)}`}>
                {analysis.overallSentiment.label}
                <span className="text-sm ml-2">
                  ({analysis.overallSentiment.score >= 0 ? "+" : ""}
                  {analysis.overallSentiment.score.toFixed(2)})
                </span>
              </span>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center mb-2">
              <Settings className="w-5 h-5 text-primary mr-2" />
              <h3 className="font-medium">Formality</h3>
            </div>
            <div className="flex items-center justify-center py-2">
              <Badge className={`px-3 py-1 ${getFormalityLabel(analysis.formality.level)}`}>
                {analysis.formality.level}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Additional Information */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <div className="flex items-center mb-2">
            <Info className="w-5 h-5 text-primary mr-2" />
            <h3 className="font-medium">Additional Info</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {analysis.readabilityScore !== undefined && (
              <div>
                <p className="text-sm text-muted-foreground">Readability</p>
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  <p className="font-medium">{analysis.readabilityScore.toFixed(1)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Thermometer className="w-5 h-5 mr-2" />
          Tone Analyzer
        </CardTitle>
        <CardDescription>
          Analyze the emotional nuance and tone of your text
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!showAnalysis ? (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-center text-muted-foreground mb-6">
              Click the button below to analyze the tone, sentiment, and formality of your text. 
              Compare the original and refined versions to see how the tone has changed.
            </p>
            <Button 
              onClick={handleAnalyze} 
              disabled={analyzeToneMutation.isPending || (!originalText && !humanizedText)}
              className="min-w-32"
            >
              {analyzeToneMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Tone"
              )}
            </Button>
          </div>
        ) : (
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="original" disabled={!originalText || analyzeToneMutation.isPending}>
                Original Text
              </TabsTrigger>
              <TabsTrigger value="humanized" disabled={!humanizedText || analyzeToneMutation.isPending}>
                Refined Text
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="original" className="mt-4">
              {renderAnalysisContent(
                originalAnalysis, 
                analyzeToneMutation.isPending && activeTab === "original"
              )}
            </TabsContent>
            
            <TabsContent value="humanized" className="mt-4">
              {renderAnalysisContent(
                humanizedAnalysis, 
                analyzeToneMutation.isPending && activeTab === "humanized"
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      
      {showAnalysis && (
        <CardFooter className="flex justify-end border-t pt-4">
          <Button 
            variant="outline" 
            onClick={() => setShowAnalysis(false)}
            disabled={analyzeToneMutation.isPending}
          >
            Back
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}