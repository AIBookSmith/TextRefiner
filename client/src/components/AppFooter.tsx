export default function AppFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-sm text-gray-500">TextRefiner &copy; {new Date().getFullYear()} - Refine your AI-generated content</p>
          <div className="mt-2 flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-gray-500 text-xs">Terms</a>
            <a href="#" className="text-gray-400 hover:text-gray-500 text-xs">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-gray-500 text-xs">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
