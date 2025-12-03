import { Menu } from "lucide-react";

export const Header = () => {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto max-w-4xl px-4 h-16 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Logo</h1>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Menu size={24} className="text-gray-700" />
        </button>
      </div>
    </header>
  );
};
