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
        className="w-full rounded-full bg-gray-100 py-2 pr-4 pl-10 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-neutral-800"
      />
      {/* Magnifying glass (Unicode) */}
      <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500">
        🔍
      </span>
    </div>
  </div>
);

export default SearchBar;
