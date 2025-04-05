import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CodeIcon, InfoIcon } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface APISettingsProps {
  model: string;
  onModelChange: (value: string) => void;
  temperature: number;
  onTemperatureChange: (value: number) => void;
}

export default function APISettings({
  model,
  onModelChange,
  temperature,
  onTemperatureChange
}: APISettingsProps) {
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

  const handleTemperatureChange = (value: number[]) => {
    onTemperatureChange(value[0]);
  };

  const handleSaveApiKey = () => {
    // In a real app, this would be stored securely (e.g., local storage, HTTP-only cookie)
    // For this demo, we just show a success toast
    toast({
      variant: "success",
      title: "API Key Saved",
      description: "Your API key has been saved successfully.",
    });
  };

  return (
    <section className="mt-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-5 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <CodeIcon className="h-5 w-5 text-gray-400 mr-2" />
            API Settings
          </h2>
          <div className="text-xs text-amber-600 flex items-center">
            <p className="mr-1">Advanced settings</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">These settings are for advanced users only. Currently, only Mistral AI model is supported.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="model-info" className="block text-sm font-medium text-gray-700 mb-1">AI Model</Label>
            <div id="model-info" className="p-2 bg-gray-50 rounded border border-gray-200 text-gray-700">
              <p className="font-medium">Mistral AI</p>
              <p className="text-xs text-gray-500 mt-1">Currently, only Mistral AI is supported with generous free tier limits.</p>
            </div>
          </div>
          
          <div>
            <Label htmlFor="temperature-slider" className="block text-sm font-medium text-gray-700 mb-1">
              Creativity Level 
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="inline-block h-4 w-4 ml-1 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Higher values produce more creative, varied outputs. Lower values are more predictable and focused.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Slider 
              id="temperature-slider"
              min={0}
              max={1}
              step={0.1}
              value={[temperature]}
              onValueChange={handleTemperatureChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Conservative</span>
              <span>Balanced</span>
              <span>Creative</span>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-1">
              Mistral API Key (Optional)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="inline-block h-4 w-4 ml-1 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Using your own Mistral API key allows you to use your personal quota instead of the application's shared quota.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <Input
                type="password"
                id="api-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1"
                placeholder="Enter your Mistral API key"
              />
              <Button 
                onClick={handleSaveApiKey}
                className="ml-3"
                variant="outline"
              >
                Save
              </Button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Enter your Mistral API key to use your own Mistral AI credits.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
