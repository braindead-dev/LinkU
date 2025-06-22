"use client";
import { FC } from "react";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

/**
 * MessagesTab – floating button to navigate to messages page.
 */
const MessagesTab: FC = () => {
  return (
    <Link
      href="/messages"
      className="fixed right-4 bottom-4 flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-blue-600"
    >
      <MessageSquare className="h-4 w-4" />
      Messages
    </Link>
  );
};

export default MessagesTab;
