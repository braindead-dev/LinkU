import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { FC } from "react";
import { Database } from "@/types/database.types";

type Post = Database['public']['Tables']['posts']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

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
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return date.toLocaleDateString();
  };

  return (
    <article className="flex gap-4 p-4 border-b border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-900/50 transition-colors">
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={post.profiles.avatar_url ?? undefined} alt={`${post.profiles.username} avatar`} />
        <AvatarFallback>
          {post.profiles.full_name?.charAt(0).toUpperCase() || post.profiles.username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <header className="flex gap-2 items-baseline">
          <h3 className="font-semibold truncate">
            {post.profiles.full_name || post.profiles.username}
          </h3>
          <span className="text-sm text-gray-500 truncate">@{post.profiles.username}</span>
          <span className="text-sm text-gray-500">·</span>
          <time className="text-sm text-gray-500">{formatDate(post.created_at)}</time>
        </header>
        <p className="mt-1 whitespace-pre-wrap break-words">{post.content}</p>
        {post.image_url && (
          <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 dark:border-neutral-800">
            <Image 
              src={post.image_url} 
              alt="Post image" 
              width={500} 
              height={300} 
              className="w-full h-auto"
            />
          </div>
        )}
      </div>
    </article>
  );
};

export default PostCard; 