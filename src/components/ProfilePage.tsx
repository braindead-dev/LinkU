import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PostCard from "@/components/PostCard";
import FollowButton from "@/components/FollowButton";
import MessageButton from "@/components/MessageButton";
import { MapPinIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Database } from "@/types/database.types";

type ProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

type Post = Database["public"]["Tables"]["posts"]["Row"] & {
  profiles: Database["public"]["Tables"]["profiles"]["Row"];
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = await createClient();
  const { username } = await params;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "*, posts(*, profiles(*)), following:following!follower_id(count), followers:following!following_id(count)",
    )
    .eq("username", username)
    .single();

  if (!profile) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwnProfile = user?.id === profile.id;

  return (
    <div>
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-200 bg-white/80 px-4 py-2 backdrop-blur-md dark:border-neutral-800 dark:bg-black/80">
        <Link
          href="/"
          className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-neutral-800"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold">
            {profile.full_name || profile.username}
          </h2>
          <p className="text-md text-gray-500">
            {profile.posts.length}{" "}
            {profile.posts.length === 1 ? "post" : "posts"}
          </p>
        </div>
      </header>

      <div className="relative h-48 bg-gray-200 dark:bg-neutral-800">
        {/* Placeholder for banner image */}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="-mt-20">
            <Avatar className="h-32 w-32 border-4 border-white dark:border-black">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback>
                {profile.full_name?.charAt(0) || profile.username.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex gap-2">
            {isOwnProfile ? (
              <Link
                href="/settings/profile"
                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold transition-colors hover:bg-gray-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                Edit profile
              </Link>
            ) : (
              <>
                <MessageButton user={profile} />
                <FollowButton user={profile} currentUserId={user?.id} />
              </>
            )}
          </div>
        </div>

        <div className="mt-4">
          <h1 className="text-2xl font-bold">
            {profile.full_name || profile.username}
          </h1>
          <p className="text-gray-500">@{profile.username}</p>
        </div>

        {profile.bio && <p className="mt-2">{profile.bio}</p>}

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
          {profile.location && (
            <div className="flex items-center gap-1">
              <MapPinIcon className="h-4 w-4" />
              <span>{profile.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            <span>
              Joined{" "}
              {new Date(profile.created_at).toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="mt-2 flex gap-4 text-sm">
          <p>
            <span className="font-bold">{profile.following[0].count}</span>{" "}
            Following
          </p>
          <p>
            <span className="font-bold">{profile.followers[0].count}</span>{" "}
            Followers
          </p>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-neutral-800">
        {/* Tabs for Posts, Replies, Likes */}
        <nav className="flex justify-around">
          <button className="flex-1 border-b-2 border-blue-500 p-4 font-bold">
            Posts
          </button>
          <button className="flex-1 p-4 text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800">
            Replies
          </button>
          <button className="flex-1 p-4 text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800">
            Likes
          </button>
        </nav>
      </div>

      <div className="pb-28">
        {profile.posts
          .sort(
            (a: Post, b: Post) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          )
          .map((post: Post) => (
            <PostCard
              key={post.id}
              post={{ ...post, profiles: profile }}
              currentUserId={user?.id}
            />
          ))}
      </div>
    </div>
  );
}
