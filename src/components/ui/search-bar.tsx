import { Search } from "lucide-react";

export function SearchBar() {
  return (
    <div className="relative">
      <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-500" />
      <input
        type="text"
        placeholder="Search"
        className="w-full rounded-full bg-gray-100 py-2 pr-4 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>
  );
}
