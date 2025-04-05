import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpCircle, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Character limit constant
const MAX_CHARS = 8000;

interface InputSectionProps {
  inputText: string;
  onInputChange: (value: string) => void;
  onHumanizeClick: () => void;
  showChanges: boolean;
  onShowChangesChange: (value: boolean) => void;
  isAdvancedMode: boolean;
  onAdvancedModeChange: (value: boolean) => void;
  isLoading: boolean;
}

export default function InputSection({
  inputText,
  onInputChange,
  onHumanizeClick,
  showChanges,
  onShowChangesChange,
  isAdvancedMode,
  onAdvancedModeChange,
  isLoading
}: InputSectionProps) {
  const [charCount, setCharCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    setCharCount(inputText.length);
  }, [inputText]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    
    // Enforce character limit
    if (text.length > MAX_CHARS) {
      toast({
        variant: "destructive",
        title: "Character limit exceeded",
        description: `Please keep your text under ${MAX_CHARS} characters for optimal results.`,
      });
      // Truncate text to max length
      onInputChange(text.substring(0, MAX_CHARS));
    } else {
      onInputChange(text);
    }
  };

  // Calculate percentage of character limit used
  const charPercentage = Math.min(100, (charCount / MAX_CHARS) * 100);
  
  // Determine color based on percentage
  const getColorClass = () => {
    if (charPercentage > 90) return "text-red-500";
    if (charPercentage > 75) return "text-amber-500";
    return "text-gray-500";
  };

  return (
    <section className="col-span-1">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-medium text-gray-900">Input AI-Generated Text</h2>
          <p className="text-sm text-gray-500">Paste the text you want to humanize</p>
        </div>
        
        <div className="p-5 flex-grow flex flex-col">
          <Textarea 
            className="w-full h-64 sm:h-96 flex-grow p-3 resize-none"
            placeholder="Paste your AI-generated text here. For example:

In this comprehensive analysis, I shall be examining the various factors that contribute to climate change. It is worth noting that human activities play a significant role in accelerating this phenomenon. As we proceed, I will outline several key considerations that merit attention."
            value={inputText}
            onChange={handleTextareaChange}
            maxLength={MAX_CHARS}
          />
          
          <div className="flex justify-end mt-2">
            <p className={`text-xs ${getColorClass()}`}>
              {charCount} / {MAX_CHARS} characters
              {charPercentage > 90 && (
                <span className="ml-1 inline-flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Approaching limit
                </span>
              )}
            </p>
          </div>
          
          <div className="mt-2 flex flex-wrap justify-between items-center">
            <div className="flex items-center gap-4 mb-2 sm:mb-0">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="show-changes" 
                  checked={showChanges} 
                  onCheckedChange={(checked) => onShowChangesChange(checked as boolean)}
                />
                <Label htmlFor="show-changes" className="text-sm text-gray-700">Show changes</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="advanced-mode" 
                  checked={isAdvancedMode} 
                  onCheckedChange={(checked) => onAdvancedModeChange(checked as boolean)}
                />
                <Label htmlFor="advanced-mode" className="text-sm text-gray-700">Advanced mode</Label>
              </div>
            </div>
            
            <div>
              <Button 
                onClick={onHumanizeClick}
                disabled={!inputText.trim() || isLoading}
              >
                <ArrowUpCircle className="h-5 w-5 mr-2" />
                Refine Text
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
