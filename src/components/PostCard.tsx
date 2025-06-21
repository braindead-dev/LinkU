import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
import { Database } from "@/types/database.types";

type Post = Database["public"]["Tables"]["posts"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface PostCardProps {
  post: Post & {
    profiles: Profile;
  };
}

/**
 * PostCard – displays a single post.
 */
const PostCard: FC<PostCardProps> = ({ post }) => {
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
    <article className="flex gap-4 border-b border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-neutral-800 dark:hover:bg-neutral-900/50">
      <Link href={`/${post.profiles.username}`}>
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
        <header className="flex items-baseline gap-2">
          <Link
            href={`/${post.profiles.username}`}
            className="truncate font-semibold hover:underline"
          >
            {post.profiles.full_name || post.profiles.username}
          </Link>
          <Link
            href={`/${post.profiles.username}`}
            className="truncate text-sm text-gray-500"
          >
            @{post.profiles.username}
          </Link>
          <span className="text-sm text-gray-500">·</span>
          <time className="text-sm text-gray-500">
            {formatDate(post.created_at)}
          </time>
        </header>
        <p className="mt-1 break-words whitespace-pre-wrap">{post.content}</p>
        {post.image_url && (
          <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 dark:border-neutral-800">
            <Image
              src={post.image_url}
              alt="Post image"
              width={500}
              height={300}
              className="h-auto w-full"
            />
          </div>
        )}
      </div>
    </article>
  );
};

export default PostCard;
