"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PostCard from "@/components/PostCard";
import FollowButton from "@/components/FollowButton";
import MessageButton from "@/components/MessageButton";
import { MapPinIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Database } from "@/types/database.types";
import Image from "next/image";

type ProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

type Post = Database["public"]["Tables"]["posts"]["Row"] & {
  profiles: Database["public"]["Tables"]["profiles"]["Row"];
};

type Profile = Database["public"]["Tables"]["profiles"]["Row"] & {
  following: { count: number }[];
  followers: { count: number }[];
};

type Tab = "posts" | "replies" | "likes";

export default function ProfilePage({ params }: ProfilePageProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [replies, setReplies] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(
    undefined,
  );
  const [username, setUsername] = useState<string>("");

  const supabase = createClient();

  useEffect(() => {
    const loadParams = async () => {
      const { username } = await params;
      setUsername(username);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (username) {
      loadProfile();
      checkCurrentUser();
    }
  }, [username]);

  useEffect(() => {
    if (profile) {
      if (activeTab === "posts") {
        loadPosts();
      } else if (activeTab === "replies") {
        loadReplies();
      } else if (activeTab === "likes") {
        loadLikedPosts();
      }
    }
  }, [profile, activeTab]);

  const checkCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || undefined);
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          *,
          following:following!follower_id(count),
          followers:following!following_id(count)
        `,
        )
        .eq("username", username)
        .single();

      if (error || !data) {
        notFound();
        return;
      }

      setProfile(data as Profile);
    } catch (error) {
      console.error("Error loading profile:", error);
      notFound();
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    if (!profile) return;

    try {
      const { data } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles (*)
        `,
        )
        .eq("user_id", profile.id)
        .is("parent_post_id", null)
        .order("created_at", { ascending: false });

      setPosts(data || []);
    } catch (error) {
      console.error("Error loading posts:", error);
    }
  };

  const loadReplies = async () => {
    if (!profile) return;

    try {
      const { data } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles (*)
        `,
        )
        .eq("user_id", profile.id)
        .not("parent_post_id", "is", null)
        .order("created_at", { ascending: false });

      setReplies(data || []);
    } catch (error) {
      console.error("Error loading replies:", error);
    }
  };

  const loadLikedPosts = async () => {
    if (!profile) return;

    try {
      const { data } = await supabase
        .from("likes")
        .select(
          `
          post_id,
          posts!inner (
            *,
            profiles (*)
          )
        `,
        )
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

      if (data) {
        const posts = data.map((item) => (item as any).posts) as Post[];
        setLikedPosts(posts);
      }
    } catch (error) {
      console.error("Error loading liked posts:", error);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  const isOwnProfile = currentUserId === profile.id;
  const postCount = posts.length + replies.length;

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
            {postCount} {postCount === 1 ? "post" : "posts"}
          </p>
        </div>
      </header>

      <div className="relative h-48 bg-gray-200 dark:bg-neutral-800">
        {profile.background_url ? (
          <Image
            src={profile.background_url}
            alt={`${profile.username}'s background`}
            layout="fill"
            objectFit="cover"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gray-200 dark:bg-neutral-800" />
        )}
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
                <FollowButton user={profile} currentUserId={currentUserId} />
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
            <span className="font-bold">
              {profile.following[0]?.count || 0}
            </span>{" "}
            Following
          </p>
          <p>
            <span className="font-bold">
              {profile.followers[0]?.count || 0}
            </span>{" "}
            Followers
          </p>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-neutral-800">
        <nav className="flex justify-around">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex-1 p-4 transition-colors ${
              activeTab === "posts"
                ? "border-b-2 border-blue-500 font-bold"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800"
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab("replies")}
            className={`flex-1 p-4 transition-colors ${
              activeTab === "replies"
                ? "border-b-2 border-blue-500 font-bold"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800"
            }`}
          >
            Replies
          </button>
          <button
            onClick={() => setActiveTab("likes")}
            className={`flex-1 p-4 transition-colors ${
              activeTab === "likes"
                ? "border-b-2 border-blue-500 font-bold"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800"
            }`}
          >
            Likes
          </button>
        </nav>
      </div>

      <div className="pb-28">
        {activeTab === "posts" &&
          (posts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No posts yet</div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId || undefined}
              />
            ))
          ))}

        {activeTab === "replies" &&
          (replies.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No replies yet</div>
          ) : (
            replies.map((reply) => (
              <PostCard
                key={reply.id}
                post={reply}
                currentUserId={currentUserId || undefined}
              />
            ))
          ))}

        {activeTab === "likes" &&
          (likedPosts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No liked posts yet
            </div>
          ) : (
            likedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId || undefined}
              />
            ))
          ))}
      </div>
    </div>
  );
}
