"use client";
import { FC, useEffect, useState } from "react";
import Image from "next/image";
import { Database } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";
import UserCard from "./UserCard";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { config } from "@/lib/config";
import Toast from "@/components/ui/toast";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface SuggestedUsersProps {
  currentUserId?: string;
  currentProfile?: Profile | null;
}

/**
 * SuggestedUsers – displays a list of suggested users to follow.
 */
const SuggestedUsers: FC<SuggestedUsersProps> = ({
  currentUserId,
  currentProfile,
}) => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
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

  const handleConnectForMe = async () => {
    if (!currentProfile?.id) {
      console.error("No user profile available");
      return;
    }

    try {
      const response = await fetch(`${config.matchApiEndpoint}/api/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: currentProfile.id,
          agent_id: currentProfile.agent_id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Connect for me request successful:", result);

      // Show success toast
      setShowToast(true);
    } catch (error) {
      console.error("Error sending connect for me request:", error);
    }
  };

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
    <>
      <Toast
        message="Connections have been queued!"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={4000}
      />
      <div className="overflow-hidden rounded-2xl bg-gray-50 dark:bg-neutral-900">
        <div className="flex items-center justify-between p-4 pb-0">
          <h2 className="text-xl font-bold">Who to follow</h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="rounded-lg bg-white p-1 shadow-sm transition-colors duration-100 hover:cursor-pointer hover:bg-gray-50"
                onClick={handleConnectForMe}
              >
                <Image
                  src="/square_logo.png"
                  alt="Linku Logo"
                  width={20}
                  height={20}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Connect for me</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="py-2">
          {users.map((user) => (
            <UserCard key={user.id} user={user} currentUserId={currentUserId} />
          ))}
        </div>
      </div>
    </>
  );
};

export default SuggestedUsers;
