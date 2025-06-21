"use client";
import { FC, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Database } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

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

  return (
    <div className="flex gap-4 border-b border-gray-200 p-4 dark:border-neutral-800">
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={profile?.avatar_url ?? undefined} alt="Profile" />
        <AvatarFallback>
          {profile?.full_name?.charAt(0).toUpperCase() ||
            profile?.username?.charAt(0).toUpperCase() ||
            "U"}
        </AvatarFallback>
      </Avatar>

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
          <button
            onClick={handlePost}
            disabled={!content.trim() || content.length > 280 || isPosting}
            className="rounded-full bg-blue-500 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isPosting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostComposer;
