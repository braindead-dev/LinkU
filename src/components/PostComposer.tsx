'use client';
import { FC, useState } from "react";
import Image from "next/image";
import { Database } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

type Profile = Database['public']['Tables']['profiles']['Row'];

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
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: profile.id,
          content: content.trim(),
        });

      if (error) throw error;

      setContent("");
      router.refresh();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="flex gap-4 p-4 border-b border-gray-200 dark:border-neutral-800">
      {/* Avatar */}
      {profile?.avatar_url ? (
        <Image
          src={profile.avatar_url}
          alt="Profile"
          width={40}
          height={40}
          className="rounded-full shrink-0"
        />
      ) : (
        <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
      )}

      <div className="flex-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening?"
          className="w-full bg-transparent text-lg placeholder-gray-500 focus:outline-none resize-none min-h-[60px]"
          rows={1}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = target.scrollHeight + 'px';
          }}
        />
        <div className="flex justify-between items-center mt-4">
          <span className={`text-sm ${content.length > 280 ? 'text-red-500' : 'text-gray-500'}`}>
            {content.length}/280
          </span>
          <button 
            onClick={handlePost}
            disabled={!content.trim() || content.length > 280 || isPosting}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-full px-4 py-1.5 transition-colors"
          >
            {isPosting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostComposer; 