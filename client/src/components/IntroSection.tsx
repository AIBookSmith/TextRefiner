import { CheckIcon } from "lucide-react";

export default function IntroSection() {
  const features = [
    "Removes repetitive phrases",
    "Improves word choice",
    "Varies sentence structure",
    "Adds personality",
    "Supports multiple languages"
  ];

  return (
    <section className="mb-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-5 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Refine AI-Generated Text to Sound Human</h2>
        <p className="text-gray-600">
          TextRefiner identifies and improves common AI writing patterns to make your content sound more natural and human-written in multiple languages, including English, Swedish, and more.
        </p>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {features.map((feature, index) => (
            <div key={index} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs flex items-center">
              <CheckIcon className="h-3.5 w-3.5 mr-1" />
              {feature}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
