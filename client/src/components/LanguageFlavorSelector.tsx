import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { writingStyles, formalityLevels } from "@shared/schema";
import { BookText, MessageSquareText, PenTool, GraduationCap, NewspaperIcon, Briefcase, ServerIcon } from "lucide-react";

interface LanguageFlavorSelectorProps {
  selectedStyle: typeof writingStyles[number];
  onStyleChange: (style: typeof writingStyles[number]) => void;
  formalityLevel: typeof formalityLevels[number];
  onFormalityChange: (level: typeof formalityLevels[number]) => void;
}

export default function LanguageFlavorSelector({
  selectedStyle,
  onStyleChange,
  formalityLevel,
  onFormalityChange,
}: LanguageFlavorSelectorProps) {
  // Define style icons and descriptions
  const styleInfo = {
    academic: {
      icon: <GraduationCap className="h-5 w-5" />,
      description: "Scholarly tone, precise, formal vocabulary with structured arguments",
    },
    factual: {
      icon: <BookText className="h-5 w-5" />,
      description: "Clear explanations, accessible vocabulary, balanced and educational",
    },
    marketing: {
      icon: <Briefcase className="h-5 w-5" />,
      description: "Persuasive, engaging, benefit-focused with calls to action",
    },
    fiction: {
      icon: <PenTool className="h-5 w-5" />,
      description: "Creative storytelling, vivid descriptions, and emotional depth",
    },
    conversational: {
      icon: <MessageSquareText className="h-5 w-5" />,
      description: "Casual, friendly, uses contractions and approachable language",
    },
    journalistic: {
      icon: <NewspaperIcon className="h-5 w-5" />,
      description: "Concise, objective, fact-focused with clear information hierarchy",
    },
    technical: {
      icon: <ServerIcon className="h-5 w-5" />,
      description: "Precise terminology, straightforward, detailed with accurate information",
    },
  };

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-white/50">
      <h3 className="text-base font-medium mb-2">Language Flavor Settings</h3>
      
      <Tabs defaultValue="style" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger className="flex-1" value="style">Writing Style</TabsTrigger>
          <TabsTrigger className="flex-1" value="formality">Formality Level</TabsTrigger>
        </TabsList>
        
        <TabsContent value="style" className="p-2">
          <RadioGroup 
            value={selectedStyle} 
            onValueChange={onStyleChange}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2"
          >
            {writingStyles.map((style) => (
              <div key={style} className={`
                flex items-start space-x-2 border rounded-md p-2 
                ${selectedStyle === style ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}
              `}>
                <RadioGroupItem value={style} id={`style-${style}`} className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center">
                    <Label htmlFor={`style-${style}`} className="font-medium flex items-center capitalize">
                      {styleInfo[style].icon}
                      <span className="ml-1">{style}</span>
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{styleInfo[style].description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </TabsContent>
        
        <TabsContent value="formality" className="p-2">
          <RadioGroup 
            value={formalityLevel} 
            onValueChange={onFormalityChange}
            className="space-y-3 mt-2"
          >
            {formalityLevels.map((level) => (
              <div key={level} className={`
                flex items-center space-x-2 border rounded-md p-3
                ${formalityLevel === level ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}
              `}>
                <RadioGroupItem value={level} id={`formality-${level}`} />
                <Label htmlFor={`formality-${level}`} className="font-medium capitalize">{level}</Label>
                <span className="text-xs text-gray-500 ml-auto">
                  {level === 'formal' && 'Professional, no contractions, proper grammar'}
                  {level === 'neutral' && 'Balanced tone, occasional contractions'}
                  {level === 'informal' && 'Casual, conversational, uses slang and contractions'}
                </span>
              </div>
            ))}
          </RadioGroup>
        </TabsContent>
      </Tabs>
    </div>
  );
}