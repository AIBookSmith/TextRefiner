import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Lightbulb, Copy, Loader2 } from "lucide-react";

interface WritingTip {
  id: string;
  title: string;
  description: string;
  example?: string;
  textSelection?: {
    start: number;
    end: number;
  };
  suggestedChange?: string;
}

interface WritingTipsProps {
  text: string;
  writingStyle: string;
  formalityLevel: string;
  onTipsApplied: (newText: string) => void;
}

export default function WritingTips({ 
  text, 
  writingStyle, 
  formalityLevel,
  onTipsApplied
}: WritingTipsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tips, setTips] = useState<WritingTip[]>([]);
  const { toast } = useToast();
  
  const loadTips = async () => {
    if (!text) {
      toast({
        variant: "destructive",
        title: "No Text to Analyze",
        description: "There is no text to generate tips for.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/writing-tips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          writingStyle,
          formalityLevel
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Could not retrieve writing tips");
      }

      const result = await response.json();
      setTips(result.tips || []);
      setIsOpen(true);
    } catch (error) {
      console.error("Error fetching writing tips:", error);
      toast({
        variant: "destructive",
        title: "Could not fetch writing tips",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied to clipboard",
          variant: "success",
        });
      },
      () => {
        toast({
          title: "Failed to copy",
          description: "Could not copy text to clipboard",
          variant: "destructive",
        });
      }
    );
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={loadTips}
        disabled={isLoading || !text}
        className="flex items-center"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <Lightbulb className="h-4 w-4 mr-1" />
        )}
        Get Writing Tips
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Writing Tips for Your Text</DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-6">
            {tips.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground border rounded-md">
                <p>No specific tips could be generated for your text.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {tips.map((tip, index) => (
                  <div 
                    key={tip.id} 
                    className="border rounded-md p-4 bg-white"
                  >
                    <h3 className="text-lg font-medium mb-2 text-primary">{index + 1}. {tip.title}</h3>
                    <p className="text-sm text-gray-700 mb-3">{tip.description}</p>
                    
                    {tip.example && (
                      <div className="mb-3 bg-gray-50 p-3 rounded-md border">
                        <p className="text-xs text-gray-500 font-medium mb-1">Example:</p>
                        <p className="text-sm">{tip.example}</p>
                      </div>
                    )}
                    
                    {tip.suggestedChange && (
                      <div className="bg-primary-50 p-3 rounded-md border border-primary-100 relative group">
                        <div className="flex justify-between">
                          <p className="text-xs text-primary-700 font-medium mb-1">Suggested text:</p>
                          <Button 
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-50 hover:opacity-100 absolute top-2 right-2"
                            onClick={() => copyToClipboard(tip.suggestedChange || "")}
                          >
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy suggestion</span>
                          </Button>
                        </div>
                        <p className="text-sm">{tip.suggestedChange}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button onClick={closeDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}