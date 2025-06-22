"use client";

import { FC, useState, useEffect } from "react";
import { Database } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";
import PostCard from "@/components/PostCard";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Post = Database["public"]["Tables"]["posts"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type PostWithProfile = Post & { profiles: Profile };

interface PostDetailProps {
  post: PostWithProfile;
  currentUserId: string;
  currentProfile: Profile | null;
}

const PostDetail: FC<PostDetailProps> = ({
  post,
  currentUserId,
  currentProfile,
}) => {
  const [replies, setReplies] = useState<PostWithProfile[]>([]);
  const [parentPosts, setParentPosts] = useState<PostWithProfile[]>([]);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingParents, setLoadingParents] = useState(true);
  const [posting, setPosting] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    loadReplies();
    if (post.parent_post_id) {
      loadParentThread();
    } else {
      setLoadingParents(false);
    }
  }, [post.id, post.parent_post_id]);

  const loadParentThread = async () => {
    try {
      const parents: PostWithProfile[] = [];
      let currentParentId = post.parent_post_id;

      // Recursively load all parent posts
      while (currentParentId) {
        const { data: parentPost, error } = await supabase
          .from("posts")
          .select(
            `
            *,
            profiles (*)
          `,
          )
          .eq("id", currentParentId)
          .single();

        if (error || !parentPost) break;

        parents.unshift(parentPost); // Add to beginning to maintain order
        currentParentId = parentPost.parent_post_id;
      }

      setParentPosts(parents);
    } catch (error) {
      console.error("Error loading parent thread:", error);
    } finally {
      setLoadingParents(false);
    }
  };

  const loadReplies = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles (*)
        `,
        )
        .eq("parent_post_id", post.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (error) {
      console.error("Error loading replies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyContent.trim() || posting || !currentProfile) return;

    setPosting(true);
    try {
      const { error } = await supabase.from("posts").insert({
        user_id: currentUserId,
        content: replyContent.trim(),
        parent_post_id: post.id,
      });

      if (error) throw error;

      setReplyContent("");
      await loadReplies();
    } catch (error) {
      console.error("Error posting reply:", error);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-200 bg-white/80 px-4 py-2 backdrop-blur-md dark:border-neutral-800 dark:bg-black/80">
        <button
          onClick={() => router.back()}
          className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-neutral-800"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-bold">Thread</h2>
      </header>

      {/* Parent posts thread */}
      {loadingParents ? (
        <div className="p-8 text-center text-gray-500">Loading thread...</div>
      ) : (
        parentPosts.length > 0 && (
          <div>
            {parentPosts.map((parentPost, index) => (
              <div key={parentPost.id}>
                <PostCard
                  post={parentPost}
                  currentUserId={currentUserId}
                  hideReplyIndicator={true}
                  hideBorder={true}
                  threadLine={index === 0 ? "down" : "both"}
                />
              </div>
            ))}
          </div>
        )
      )}

      {/* Main post */}
      <div>
        <PostCard
          post={post}
          currentUserId={currentUserId}
          hideBorder={replies.length > 0}
          threadLine={parentPosts.length > 0 ? "up" : "none"}
          hideReplyIndicator={true}
        />
      </div>

      {/* Reply composer */}
      {currentProfile && (
        <form
          onSubmit={handleReply}
          className="border-b border-gray-100 p-4 dark:border-neutral-800"
        >
          <div className="flex gap-3">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={currentProfile.avatar_url ?? undefined} />
              <AvatarFallback>
                {currentProfile.full_name?.charAt(0) ||
                  currentProfile.username.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 items-center gap-3">
              <textarea
                value={replyContent}
                onChange={(e) => {
                  setReplyContent(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                placeholder="Post your reply"
                className="ml-2 max-h-[200px] min-h-[40px] flex-1 resize-none border-none bg-transparent py-2 text-lg outline-none placeholder:text-gray-500"
                rows={1}
              />
              <button
                type="submit"
                disabled={!replyContent.trim() || posting}
                className="rounded-full bg-blue-600 px-4 py-1.5 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {posting ? "Replying..." : "Reply"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Replies */}
      <div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading replies...
          </div>
        ) : (
          replies.map((reply, index) => (
            <PostCard
              key={reply.id}
              post={reply}
              currentUserId={currentUserId}
              hideReplyIndicator={true}
              hideBorder={index < replies.length - 1}
              threadLine="none"
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PostDetail;
