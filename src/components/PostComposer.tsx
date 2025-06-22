"use client";
import { FC, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Database } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BotMessageSquare } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { config } from "@/lib/config";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface PostComposerProps {
  profile?: Profile | null;
}

/**
 * PostComposer – input area to create a new post.
 */
const PostComposer: FC<PostComposerProps> = ({ profile }) => {
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handlePost = async () => {
    if (!content.trim() || !profile) return;

    setIsPosting(true);
    try {
      const { error } = await supabase.from("posts").insert({
        user_id: profile.id,
        content: content.trim(),
      });

      if (error) throw error;

      setContent("");
      router.refresh();
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleBotPost = async () => {
    if (!profile?.core_memories) {
      console.error("No core memories available");
      return;
    }

    try {
      const response = await fetch(`${config.matchApiEndpoint}/api/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: profile.id,
          agent_id: profile.agent_id,
          core_memories: profile.core_memories,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Bot post request successful:", result);

      // Optionally refresh the page or update the UI
      router.refresh();
    } catch (error) {
      console.error("Error sending bot post request:", error);
    }
  };

  return (
    <div className="flex gap-4 border-b border-gray-200 p-4 dark:border-neutral-800">
      <Link href={`/${profile?.username}`}>
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={profile?.avatar_url ?? undefined} alt="Profile" />
          <AvatarFallback>
            {profile?.full_name?.charAt(0).toUpperCase() ||
              profile?.username?.charAt(0).toUpperCase() ||
              "U"}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening?"
          className="min-h-[60px] w-full resize-none bg-transparent text-lg placeholder-gray-500 focus:outline-none"
          rows={1}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = target.scrollHeight + "px";
          }}
        />
        <div className="mt-4 flex items-center justify-between">
          <span
            className={`text-sm ${content.length > 280 ? "text-red-500" : "text-gray-500"}`}
          >
            {content.length}/280
          </span>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="group rounded-md p-1 hover:cursor-pointer hover:bg-gray-100"
                  onClick={handleBotPost}
                >
                  <BotMessageSquare
                    size={20}
                    className="text-gray-500 group-hover:text-gray-700"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Post for me</p>
              </TooltipContent>
            </Tooltip>
            <button
              onClick={handlePost}
              disabled={!content.trim() || content.length > 280 || isPosting}
              className="rounded-full bg-blue-500 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isPosting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostComposer;
