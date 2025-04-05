import { Button } from "@/components/ui/button";
import { Loader2, Copy, Download, CheckCircle, MessageSquare, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogClose, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import WritingTips from "./WritingTips";

interface HighlightedTextProps {
  text: string;
  changes: { original: string; replacement: string }[] | undefined;
  showChanges: boolean;
}

interface OutputSectionProps {
  originalText: string;
  humanizedText: string | null;
  changes: { original: string; replacement: string }[] | undefined;
  changeCount: number;
  showChanges: boolean;
  isLoading: boolean;
  onFeedback?: (feedback: string, previousOutputId: number) => void;
  onUpdateText?: (updatedText: string) => void;
  outputId?: number;
  writingStyle?: string;
  formalityLevel?: string;
}

// Component to render text with highlights for changes
function HighlightedText({ text, changes, showChanges }: HighlightedTextProps) {
  if (!text || !changes || !showChanges) {
    return <p>{text}</p>;
  }

  // Sort changes by their position in the text to avoid overlap issues
  const sortedChanges = [...changes].sort((a, b) => {
    const indexA = text.indexOf(a.replacement);
    const indexB = text.indexOf(b.replacement);
    return indexA - indexB;
  });

  let result = [];
  let lastIndex = 0;

  for (const change of sortedChanges) {
    const index = text.indexOf(change.replacement, lastIndex);
    
    if (index === -1) continue;
    
    // Add text before the current change
    if (index > lastIndex) {
      result.push(text.substring(lastIndex, index));
    }
    
    // Add highlighted change
    result.push(
      <span key={index} className="highlight-change">
        {change.replacement}
      </span>
    );
    
    lastIndex = index + change.replacement.length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex));
  }

  return <p>{result}</p>;
}

export default function OutputSection({
  originalText,
  humanizedText,
  changes,
  changeCount,
  showChanges,
  isLoading,
  onFeedback,
  onUpdateText,
  outputId,
  writingStyle = "conversational",
  formalityLevel = "neutral"
}: OutputSectionProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  const handleCopy = () => {
    if (humanizedText) {
      navigator.clipboard.writeText(humanizedText)
        .then(() => {
          setCopied(true);
          toast({
            variant: "success",
            title: "Klart",
            description: "Texten kopierad till urklipp",
          });
          
          // Reset copied state after 2 seconds
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          toast({
            variant: "destructive",
            title: "Fel",
            description: "Kunde inte kopiera texten",
          });
        });
    }
  };

  const handleDownload = () => {
    if (humanizedText) {
      const blob = new Blob([humanizedText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "refined-text.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        variant: "success",
        title: "Klart",
        description: "Texten har laddats ned",
      });
    }
  };
  
  const handleFeedback = () => {
    setShowFeedbackDialog(true);
  };
  
  const handleSubmitFeedback = () => {
    if (onFeedback && outputId && feedbackText.trim()) {
      onFeedback(feedbackText, outputId);
      setShowFeedbackDialog(false);
      setFeedbackText("");
      
      toast({
        variant: "success",
        title: "Feedback skickad",
        description: "Din feedback har tagits emot och vi bearbetar din begäran.",
      });
    }
  };

  return (
    <>
      <section className="col-span-1">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
          <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-base font-medium text-gray-900">Refined Result</h2>
              <p className="text-sm text-gray-500">Showing the improved text</p>
            </div>
            {isLoading && (
              <div>
                <div className="flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  <span className="text-xs font-medium loading-dots">Processing</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-5 flex-grow flex flex-col">
            {!humanizedText && !isLoading ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-5">
                <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900">No text processed yet</h3>
                <p className="mt-1 text-sm text-gray-500 max-w-xs">
                  Enter your AI-generated text and click "Refine Text" to see the refined version here.
                </p>
              </div>
            ) : (
              <div className="flex-grow flex flex-col">
                <div className="w-full h-64 sm:h-96 flex-grow p-3 border border-gray-300 rounded-md bg-gray-50 overflow-y-auto focus:outline-none">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                  ) : (
                    <HighlightedText 
                      text={humanizedText || ''} 
                      changes={changes} 
                      showChanges={showChanges}
                    />
                  )}
                </div>
                
                {/* Result info and actions */}
                <div className="mt-4 space-y-3">
                  {/* Status info - on its own row */}
                  <div className="text-sm text-gray-500 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-1" />
                    <span>{changeCount} improvements made</span>
                  </div>
                  
                  {/* Action buttons - in a single row evenly spaced */}
                  <div className="flex justify-end items-center space-x-2">
                    {onFeedback && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleFeedback}
                        disabled={isLoading || !humanizedText}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Give Feedback
                      </Button>
                    )}
                    
                    <WritingTips
                      text={humanizedText || ''}
                      writingStyle={writingStyle}
                      formalityLevel={formalityLevel}
                      onTipsApplied={(updatedText) => {
                        if (onUpdateText) {
                          onUpdateText(updatedText);
                        }
                      }}
                    />
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleDownload}
                      disabled={isLoading || !humanizedText}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCopy}
                      disabled={isLoading || !humanizedText}
                    >
                      {copied ? (
                        <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 mr-1" />
                      )}
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="sm:max-w-[425px]" aria-describedby="feedback-description">
          <DialogHeader>
            <DialogTitle>Give Feedback</DialogTitle>
            <p id="feedback-description" className="text-sm text-muted-foreground">
              Tell us how you want the text to be improved.
            </p>
            <DialogClose className="absolute right-4 top-4 opacity-70 ring-offset-background transition-opacity hover:opacity-100">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="feedback" className="text-sm font-medium">
                How would you like to change the text?
              </label>
              <Textarea
                id="feedback"
                placeholder="For example: 'Make the text more personal', 'Use simpler words', 'Improve sentence structure'..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowFeedbackDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              onClick={handleSubmitFeedback}
              disabled={!feedbackText.trim()}
            >
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
