"use client";
import { FC, useState } from "react";

/**
 * MessagesTab – floating button to open messages panel.
 */
const MessagesTab: FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-4 bottom-4">
      {open && (
        <div className="mb-2 flex h-96 w-80 flex-col rounded-xl border border-gray-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          <header className="flex-0 border-b border-gray-200 p-4 font-semibold dark:border-neutral-800">
            Messages
          </header>
          <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
            Coming soon
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-blue-600"
      >
        Messages
      </button>
    </div>
  );
};

export default MessagesTab;
