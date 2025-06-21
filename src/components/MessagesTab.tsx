'use client';
import { FC, useState } from "react";

/**
 * MessagesTab – floating button to open messages panel.
 */
const MessagesTab: FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4">
      {open && (
        <div className="mb-2 w-80 h-96 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl shadow-lg flex flex-col">
          <header className="p-4 border-b border-gray-200 dark:border-neutral-800 font-semibold flex-0">
            Messages
          </header>
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
            Coming soon
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 py-2 text-sm font-semibold shadow-lg"
      >
        Messages
      </button>
    </div>
  );
};

export default MessagesTab; 