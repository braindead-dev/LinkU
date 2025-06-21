"use client";
import { FC, useState, useEffect, useCallback } from "react";
import { Database } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface FollowButtonProps {
  user: Profile;
  currentUserId?: string;
}

/**
 * FollowButton – simple follow/unfollow button without extra UI elements.
 */
const FollowButton: FC<FollowButtonProps> = ({ user, currentUserId }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const checkFollowing = useCallback(async () => {
    if (!currentUserId) return;

    const { data } = await supabase
      .from("following")
      .select("id")
      .eq("follower_id", currentUserId)
      .eq("following_id", user.id)
      .single();

    setIsFollowing(!!data);
  }, [currentUserId, user.id, supabase]);

  useEffect(() => {
    if (currentUserId && currentUserId !== user.id) {
      checkFollowing();
    }
  }, [currentUserId, user.id, checkFollowing]);

  const handleFollow = async () => {
    if (!currentUserId || loading) return;

    setLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from("following")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", user.id);
      } else {
        // Follow
        await supabase.from("following").insert({
          follower_id: currentUserId,
          following_id: user.id,
        });
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if it's the user's own profile or no current user
  if (!currentUserId || currentUserId === user.id) {
    return null;
  }

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        isFollowing
          ? "border border-gray-300 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-gray-700"
          : "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
      } disabled:opacity-50`}
    >
      {loading ? "..." : isFollowing ? "Following" : "Follow"}
    </button>
  );
};

export default FollowButton;
