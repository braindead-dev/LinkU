"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import Link from "next/link";
import { FC, useState, useEffect } from "react";
import { Database } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";
import { Heart, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Post = Database["public"]["Tables"]["posts"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Like = Database["public"]["Tables"]["likes"]["Row"];

interface PostCardProps {
  post: Post & {
    profiles: Profile;
    likes?: Like[];
    replies?: Post[];
    _count?: {
      likes: number;
      replies: number;
    };
  };
  currentUserId?: string;
  hideReplyIndicator?: boolean;
  hideBorder?: boolean;
}

/**
 * PostCard – displays a single post with like and reply functionality.
 */
const PostCard: FC<PostCardProps> = ({
  post,
  currentUserId,
  hideReplyIndicator = false,
  hideBorder = false,
}) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [replyCount, setReplyCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Load initial like state and counts
    loadPostStats();
  }, [post.id]);

  const loadPostStats = async () => {
    try {
      // Check if current user has liked this post
      if (currentUserId) {
        const { data: userLike } = await supabase
          .from("likes")
          .select("*")
          .eq("post_id", post.id)
          .eq("user_id", currentUserId)
          .single();

        setLiked(!!userLike);
      }

      // Get like count
      const { count: likeCount } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", post.id);

      setLikeCount(likeCount || 0);

      // Get reply count
      const { count: replyCount } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("parent_post_id", post.id);

      setReplyCount(replyCount || 0);
    } catch (error) {
      console.error("Error loading post stats:", error);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!currentUserId) {
      router.push("/login");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (liked) {
        // Unlike
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", currentUserId);

        if (!error) {
          setLiked(false);
          setLikeCount((prev) => Math.max(0, prev - 1));
        }
      } else {
        // Like
        const { error } = await supabase.from("likes").insert({
          post_id: post.id,
          user_id: currentUserId,
        });

        if (!error) {
          setLiked(true);
          setLikeCount((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to post detail page where user can reply
    router.push(`/post/${post.id}`);
  };

  const handlePostClick = () => {
    router.push(`/post/${post.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return date.toLocaleDateString();
  };

  return (
    <article
      onClick={handlePostClick}
      className={cn(
        "flex cursor-pointer gap-4 px-4 pt-4 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-900/50",
        !hideBorder
          ? "border-b border-gray-100 pb-4 dark:border-neutral-800"
          : "pb-0",
      )}
    >
      <Link
        href={`/${post.profiles.username}`}
        onClick={(e) => e.stopPropagation()}
      >
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage
            src={post.profiles.avatar_url ?? undefined}
            alt={`${post.profiles.username} avatar`}
          />
          <AvatarFallback>
            {post.profiles.full_name?.charAt(0).toUpperCase() ||
              post.profiles.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="min-w-0 flex-1">
        <header className="-mt-1 flex items-baseline gap-2">
          <Link
            href={`/${post.profiles.username}`}
            onClick={(e) => e.stopPropagation()}
            className="truncate font-semibold hover:underline"
          >
            {post.profiles.full_name || post.profiles.username}
          </Link>
          <Link
            href={`/${post.profiles.username}`}
            onClick={(e) => e.stopPropagation()}
            className="truncate text-sm text-gray-500"
          >
            @{post.profiles.username}
          </Link>
          <span className="text-sm text-gray-500">·</span>
          <time className="text-sm text-gray-500">
            {formatDate(post.created_at)}
          </time>
        </header>

        {post.parent_post_id && !hideReplyIndicator && (
          <p className="mb-1 text-sm text-gray-500">Replying to a post</p>
        )}

        <p className="break-words whitespace-pre-wrap">{post.content}</p>

        {post.image_url && (
          <div className="mt-3 overflow-hidden rounded-2xl border border-gray-100 dark:border-neutral-800">
            <Image
              src={post.image_url}
              alt="Post image"
              width={500}
              height={300}
              className="h-auto w-full"
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-1 -ml-1 flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`group flex items-center transition-colors ${
              liked ? "text-red-500" : "text-gray-500 hover:text-red-500"
            }`}
          >
            <div className="rounded-full p-1 transition-colors group-hover:bg-red-50 dark:group-hover:bg-red-950/20">
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            </div>
            {likeCount > 0 && <span className="text-sm">{likeCount}</span>}
          </button>

          <button
            onClick={handleReply}
            className="group flex items-center text-gray-500 transition-colors hover:text-blue-500"
          >
            <div className="rounded-full p-1 transition-colors group-hover:bg-blue-50 dark:group-hover:bg-blue-950/20">
              <MessageCircle className="h-4 w-4" />
            </div>
            {replyCount > 0 && <span className="text-sm">{replyCount}</span>}
          </button>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
