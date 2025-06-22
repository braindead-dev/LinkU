"use client";

import { FC } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { Database } from "@/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface MessageButtonProps {
  user: Profile;
}

const MessageButton: FC<MessageButtonProps> = ({ user }) => {
  const router = useRouter();

  const handleClick = () => {
    // Navigate to messages page with user pre-selected
    router.push(`/messages?user=${user.username}`);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold transition-colors hover:bg-gray-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
    >
      <MessageSquare className="h-4 w-4" />
      Message
    </button>
  );
};

export default MessageButton;
