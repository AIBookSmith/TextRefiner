import { InfoIcon } from "lucide-react";

interface AIPattern {
  name: string;
  description: string;
  example: {
    original: string;
    improved: string;
  };
}

export default function AIPatternExplanation() {
  const patterns: AIPattern[] = [
    {
      name: "Formal Phrases",
      description: "AI tends to use overly formal language like \"it is worth noting\" and \"shall be\".",
      example: {
        original: "I shall be examining the various factors",
        improved: "I'm looking at what causes"
      }
    },
    {
      name: "Wordy Transitions",
      description: "AI often uses unnecessary transitional phrases that sound mechanical.",
      example: {
        original: "As we proceed, I will outline several key considerations that merit attention",
        improved: "Let me walk you through some important points to consider"
      }
    },
    {
      name: "Hedging Language",
      description: "AI often uses hedging words like \"may,\" \"potentially,\" and \"could possibly.\"",
      example: {
        original: "Human activities may potentially play a significant role",
        improved: "Human activities definitely speed up"
      }
    },
    {
      name: "Repetitive Structure",
      description: "AI tends to use similar sentence lengths and structures throughout paragraphs.",
      example: {
        original: "First, X is important. Second, Y is crucial. Third, Z is significant.",
        improved: "X matters most. While Y can't be ignored, Z might surprise you."
      }
    }
  ];

  return (
    <section className="mt-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-5 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recognized AI Patterns</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patterns.map((pattern, index) => (
            <div key={index} className="bg-gray-50 rounded-md p-4 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-1 flex items-center">
                <InfoIcon className="h-4 w-4 text-primary-500 mr-1.5" />
                {pattern.name}
              </h3>
              <div className="text-sm text-gray-600">
                <p className="mb-2">{pattern.description}</p>
                <div className="flex items-start mt-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 italic">Example:</p>
                    <div className="text-xs mt-1">
                      <div className="line-through text-gray-400">"{pattern.example.original}"</div>
                      <div className="text-green-600 mt-1">"{pattern.example.improved}"</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
