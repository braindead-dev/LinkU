"use client";
import { FC, useEffect, useState } from "react";
import { Database } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";
import UserCard from "./UserCard";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface SuggestedUsersProps {
  currentUserId?: string;
}

/**
 * SuggestedUsers – displays a list of suggested users to follow.
 */
const SuggestedUsers: FC<SuggestedUsersProps> = ({ currentUserId }) => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        // For now, just get all users except the current user
        // In a real app, you'd have a more sophisticated recommendation algorithm
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .neq("id", currentUserId || "")
          .limit(5);

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error("Error fetching suggested users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedUsers();
  }, [currentUserId, supabase]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-gray-50 p-4 dark:bg-neutral-900">
        <h2 className="mb-4 text-xl font-bold">Who to follow</h2>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-gray-50 dark:bg-neutral-900">
      <h2 className="p-4 pb-0 text-xl font-bold">Who to follow</h2>
      <div className="py-2">
        {users.map((user) => (
          <UserCard key={user.id} user={user} currentUserId={currentUserId} />
        ))}
      </div>
    </div>
  );
};

export default SuggestedUsers;
