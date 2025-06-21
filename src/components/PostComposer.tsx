'use client';
import { FC } from "react";
import Image from "next/image";
import { Database } from "@/types/database.types";

type Profile = Database['public']['Tables']['profiles']['Row'];

interface PostComposerProps {
  profile?: Profile | null;
}

/**
 * PostComposer – input area to create a new post.
 */
const PostComposer: FC<PostComposerProps> = ({ profile }) => (
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
      <input
        type="text"
        placeholder="What's happening?"
        className="w-full bg-transparent text-lg placeholder-gray-500 focus:outline-none"
      />
      <div className="flex justify-end mt-4">
        <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-full px-4 py-1.5">
          Post
        </button>
      </div>
    </div>
  </div>
);

export default PostComposer; 