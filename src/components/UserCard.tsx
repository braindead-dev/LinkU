'use client';
import { FC, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Database } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";

type Profile = Database['public']['Tables']['profiles']['Row'];

interface UserCardProps {
  user: Profile;
  currentUserId?: string;
}

/**
 * UserCard – displays a user with follow/unfollow button.
 */
const UserCard: FC<UserCardProps> = ({ user, currentUserId }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const checkFollowing = useCallback(async () => {
    if (!currentUserId) return;
    
    const { data } = await supabase
      .from('following')
      .select('id')
      .eq('follower_id', currentUserId)
      .eq('following_id', user.id)
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
          .from('following')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', user.id);
      } else {
        // Follow
        await supabase
          .from('following')
          .insert({
            follower_id: currentUserId,
            following_id: user.id,
          });
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-neutral-900/50 transition-colors">
      <div className="flex items-center gap-3">
        {user.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={`${user.username} avatar`}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
        )}
        <div>
          <h3 className="font-semibold">{user.full_name || user.username}</h3>
          <p className="text-sm text-gray-500">@{user.username}</p>
        </div>
      </div>
      
      {currentUserId && currentUserId !== user.id && (
        <button
          onClick={handleFollow}
          disabled={loading}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
            isFollowing
              ? 'border border-gray-300 dark:border-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
              : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
          } disabled:opacity-50`}
        >
          {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
        </button>
      )}
    </div>
  );
};

export default UserCard; 