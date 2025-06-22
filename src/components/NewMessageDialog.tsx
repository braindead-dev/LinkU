"use client";

import { FC, useState, useEffect } from "react";
import { Database } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface NewMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
}

const NewMessageDialog: FC<NewMessageDialogProps> = ({
  open,
  onOpenChange,
  currentUserId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (open) {
      loadSuggestedUsers();
    }
  }, [open]);

  const loadSuggestedUsers = async () => {
    setLoading(true);
    try {
      // Get users that the current user follows
      const { data: following } = await supabase
        .from("following")
        .select("following_id")
        .eq("follower_id", currentUserId);

      const followingIds = following?.map((f) => f.following_id) || [];

      // Get profiles of followed users
      if (followingIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", followingIds)
          .order("username");

        setUsers(profiles || []);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: Profile) => {
    onOpenChange(false);
    router.push(`/messages?user=${user.username}`);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden p-0">
        <DialogHeader className="border-b p-4">
          <DialogTitle className="text-center">New message</DialogTitle>
        </DialogHeader>

        <div className="border-b p-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold">To:</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="flex-1 bg-transparent outline-none"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchQuery ? "No users found" : "Follow users to message them"}
            </div>
          ) : (
            <>
              <div className="px-4 pt-3 pb-2">
                <h3 className="text-sm font-semibold text-gray-500">
                  Suggested
                </h3>
              </div>
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-900"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url ?? undefined} />
                    <AvatarFallback>
                      {user.full_name?.charAt(0) || user.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">
                      {user.full_name || user.username}
                    </p>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                </button>
              ))}
            </>
          )}
        </div>

        <div className="border-t p-4">
          <button
            disabled={filteredUsers.length === 0}
            className="w-full rounded-lg bg-blue-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Chat
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewMessageDialog;
