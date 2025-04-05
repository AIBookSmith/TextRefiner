import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";

export default function AppHeader() {
  const [helpOpen, setHelpOpen] = useState(false);
  
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-semibold text-gray-900">TextRefiner</h1>
              <p className="text-xs text-gray-500">AI Text Humanizer</p>
            </div>
          </div>
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full text-xs"
              onClick={() => setHelpOpen(true)}
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              Help
            </Button>
          </div>
        </div>
      </div>
      
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">TextRefiner Guide</DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
            <DialogDescription>
              Learn how to use TextRefiner to make your AI-generated content sound more natural and human
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Getting Started</h3>
                <div className="mt-2 space-y-3 text-gray-700 text-sm">
                  <p>TextRefiner helps transform AI-generated content to sound more natural and human-like. It identifies common AI patterns and replaces them with more conversational alternatives, refining your text while removing telltale signs of AI generation.</p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Paste your AI-generated text in the input area.</li>
                    <li>Adjust your writing style and formality level preferences.</li>
                    <li>Click "Refine Text" to process your content.</li>
                    <li>Review the changes and improved version.</li>
                  </ol>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">Features</h3>
                <div className="mt-2 space-y-3 text-gray-700 text-sm">
                  <div>
                    <p className="font-medium">Language Flavor Selector</p>
                    <p>Choose from different writing styles (Academic, Conversational, Technical, etc.) and adjust the formality level to match your target audience.</p>
                  </div>
                  
                  <div>
                    <p className="font-medium">Tone Analyzer</p>
                    <p>See how your text changes in tone, sentiment, and readability before and after humanization.</p>
                  </div>
                  
                  <div>
                    <p className="font-medium">Track Changes</p>
                    <p>Enable "Show changes" to highlight modifications made to your text, allowing you to see the specific improvements.</p>
                  </div>
                  
                  <div>
                    <p className="font-medium">Writing Tips</p>
                    <p>After refining your text, click "Get Writing Tips" to receive specific suggestions for further improvement. You can apply tips individually or all at once.</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">Tips for Best Results</h3>
                <div className="mt-2 space-y-3 text-gray-700 text-sm">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Keep your text under 8,000 characters for the best results.</li>
                    <li>Use the feedback option to further refine results if needed.</li>
                    <li>Different writing styles work better for different types of content.</li>
                    <li>Academic texts generally benefit from more formal settings, while blog posts work better with conversational tones.</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">Advanced Mode</h3>
                <p className="mt-2 text-gray-700 text-sm">
                  Enable Advanced Mode to access additional settings for power users.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
