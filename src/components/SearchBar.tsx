import { FC } from "react";

/**
 * SearchBar – simple rounded search input used in the right column.
 */
const SearchBar: FC = () => (
  <div className="w-full p-4">
    <div className="relative">
      <input
        type="text"
        placeholder="Search"
        className="w-full bg-gray-100 dark:bg-neutral-800 text-sm rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {/* Magnifying glass (Unicode) */}
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
    </div>
  </div>
);

export default SearchBar; 