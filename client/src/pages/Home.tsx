import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { HumanizeTextRequest, OpenAIResponse, writingStyles, formalityLevels } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import IntroSection from "@/components/IntroSection";
import InputSection from "@/components/InputSection";
import OutputSection from "@/components/OutputSection";
import AIPatternExplanation from "@/components/AIPatternExplanation";
import APISettings from "@/components/APISettings";
import ToneAnalyzer from "@/components/ToneAnalyzer";
import LanguageFlavorSelector from "@/components/LanguageFlavorSelector";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [humanizedText, setHumanizedText] = useState<string | null>(null);
  const [changes, setChanges] = useState<Array<{ original: string; replacement: string }> | undefined>(undefined);
  const [changeCount, setChangeCount] = useState(0);
  const [showChanges, setShowChanges] = useState(true);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [model, setModel] = useState("mistral"); // Always use Mistral AI
  const [temperature, setTemperature] = useState(0.7); // Default temperature
  const [outputId, setOutputId] = useState<number | undefined>(undefined);
  const [selectedStyle, setSelectedStyle] = useState<typeof writingStyles[number]>("conversational"); // Default writing style
  const [formalityLevel, setFormalityLevel] = useState<typeof formalityLevels[number]>("neutral"); // Default formality level
  
  const { toast } = useToast();
  
  // Mutation for humanizing text
  const { mutate: humanizeText, isPending: isHumanizing } = useMutation({
    mutationFn: async () => {
      const payload: HumanizeTextRequest = {
        text: inputText,
        showChanges,
        temperature,
        model,
        writingStyle: selectedStyle,
        formalityLevel: formalityLevel
      };
      
      const response = await apiRequest("POST", "/api/humanize", payload);
      return response.json();
    },
    onSuccess: (data) => {
      setHumanizedText(data.humanizedText);
      setChanges(data.changes);
      setChangeCount(data.changes.length);
      if (data.id) {
        setOutputId(data.id);
      }
      
      toast({
        variant: "success",
        title: "Success",
        description: "Text successfully humanized!",
      });
    },
    onError: (error: Error) => {
      let errorMsg = error.message;
      
      // Check for API key errors specifically
      if (errorMsg.includes("API key")) {
        if (errorMsg.includes("Mistral")) {
          errorMsg = "There's an issue with the Mistral AI API key. Please check that a valid key has been provided.";
        } else if (errorMsg.includes("OpenAI")) {
          errorMsg = "There's an issue with the OpenAI API key. Please check that a valid key has been provided.";
        } else {
          errorMsg = "There's an issue with the AI service API key. Please check that a valid key has been provided.";
        }
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to humanize text: ${errorMsg}`,
      });
    }
  });
  
  // Mutation for sending feedback
  const { mutate: submitFeedback } = useMutation({
    mutationFn: async (data: { feedback: string, outputId: number }) => {
      const response = await apiRequest("POST", "/api/feedback", data);
      return response.json();
    },
    onSuccess: (data) => {
      // Update UI with the improved text
      setHumanizedText(data.humanizedText);
      setChanges(data.changes);
      setChangeCount(data.changes.length);
      setOutputId(data.id);
      
      toast({
        variant: "success",
        title: "Text Improved",
        description: "Your text has been updated based on your feedback!",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
      });
    }
  });
  
  const handleHumanizeClick = () => {
    if (!inputText.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter some text to humanize",
      });
      return;
    }
    
    humanizeText();
  };
  
  const handleFeedback = (feedback: string, previousOutputId: number) => {
    submitFeedback({ feedback, outputId: previousOutputId });
  };
  
  const handleUpdateText = (updatedText: string) => {
    setHumanizedText(updatedText);
    // We don't update changes or change count since writing tips are applied after initial refinement
    
    toast({
      variant: "success",
      title: "Text Updated",
      description: "Your text has been updated with the selected writing tips!",
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      <AppHeader />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow">
        <IntroSection />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <InputSection 
              inputText={inputText}
              onInputChange={setInputText}
              onHumanizeClick={handleHumanizeClick}
              showChanges={showChanges}
              onShowChangesChange={setShowChanges}
              isAdvancedMode={isAdvancedMode}
              onAdvancedModeChange={setIsAdvancedMode}
              isLoading={isHumanizing}
            />
            
            <LanguageFlavorSelector 
              selectedStyle={selectedStyle}
              onStyleChange={(style) => setSelectedStyle(style as typeof writingStyles[number])}
              formalityLevel={formalityLevel}
              onFormalityChange={(level) => setFormalityLevel(level as typeof formalityLevels[number])}
            />
          </div>
          
          <OutputSection 
            originalText={inputText}
            humanizedText={humanizedText}
            changes={changes}
            changeCount={changeCount}
            showChanges={showChanges}
            isLoading={isHumanizing}
            onFeedback={handleFeedback}
            onUpdateText={handleUpdateText}
            outputId={outputId}
            writingStyle={selectedStyle}
            formalityLevel={formalityLevel}
          />
        </div>
        
        {/* Tone Analyzer Component */}
        {(inputText || humanizedText) && (
          <div className="mt-8">
            <ToneAnalyzer 
              originalText={inputText.trim() ? inputText : null}
              humanizedText={humanizedText}
            />
          </div>
        )}
        
        <div className="mt-8">
          <AIPatternExplanation />
        </div>
        
        {isAdvancedMode && (
          <div className="mt-8">
            <APISettings 
              model={model}
              onModelChange={setModel}
              temperature={temperature}
              onTemperatureChange={setTemperature}
            />
          </div>
        )}
      </main>
      
      <AppFooter />
    </div>
  );
}
