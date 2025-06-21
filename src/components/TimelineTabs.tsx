"use client";
import { FC, useState, useEffect, useCallback } from "react";
import PostComposer from "@/components/PostComposer";
import PostCard from "@/components/PostCard";
import { Database } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";

const TABS = ["For you", "Following"] as const;
type Tab = (typeof TABS)[number];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Post = Database["public"]["Tables"]["posts"]["Row"] & {
  profiles: Profile;
};

interface TimelineTabsProps {
  profile?: Profile | null;
}

/**
 * TabNav – internal component for switching between timeline tabs.
 */
const TabNav: FC<{
  tabs: readonly Tab[];
  active: string;
  onChange: (t: Tab) => void;
}> = ({ tabs, active, onChange }) => (
  <nav className="sticky top-0 z-10 flex border-b border-gray-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-black/80">
    {tabs.map((tab) => (
      <button
        key={tab}
        onClick={() => onChange(tab)}
        className={`flex-1 py-4 font-medium transition-colors hover:bg-gray-50 dark:hover:bg-neutral-900 ${
          active === tab ? "border-b-2 border-blue-500" : "text-gray-500"
        }`}
      >
        {tab}
      </button>
    ))}
  </nav>
);

/**
 * TimelineTabs – renders tab navigation and timeline content.
 */
const TimelineTabs: FC<TimelineTabsProps> = ({ profile }) => {
  const [active, setActive] = useState<Tab>(TABS[0]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("posts")
        .select(
          `
          *,
          profiles (*)
        `,
        )
        .order("created_at", { ascending: false });

      if (active === "Following" && profile) {
        // First get the list of users this person is following
        const { data: following } = await supabase
          .from("following")
          .select("following_id")
          .eq("follower_id", profile.id);

        if (following && following.length > 0) {
          const followingIds = following.map((f) => f.following_id);
          query = query.in("user_id", followingIds);
        } else {
          // If not following anyone, show empty
          setPosts([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, [active, profile, supabase]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Subscribe to new posts
  useEffect(() => {
    const channel = supabase
      .channel("posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        () => {
          fetchPosts();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchPosts]);

  return (
    <section>
      <TabNav tabs={TABS} active={active} onChange={setActive} />
      <PostComposer profile={profile} />

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          {active === "Following"
            ? "No posts from people you follow yet. Follow some users to see their posts here!"
            : "No posts yet. Be the first to post something!"}
        </div>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </section>
  );
};

export default TimelineTabs;
