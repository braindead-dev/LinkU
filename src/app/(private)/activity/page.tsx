import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ActivityTabs from "@/components/ActivityTabs";
import SearchBar from "@/components/SearchBar";
import SuggestedUsers from "@/components/SuggestedUsers";
import { getUnreadConversationsCount } from "@/utils/unreadCount";

export default async function ActivityPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // Get unread conversations count
  const unreadCount = await getUnreadConversationsCount(user.id);

  return (
    <div className="mx-auto flex max-w-7xl">
      <Sidebar profile={profile} unreadCount={unreadCount} />

      {/* Activity Feed */}
      <main className="min-h-screen flex-1 border-x border-gray-100 pb-24 dark:border-neutral-800">
        <ActivityTabs profile={profile} />
      </main>

      {/* Right column */}
      <aside className="hidden w-96 space-y-4 xl:block">
        <SearchBar />
        <div className="px-4">
          <SuggestedUsers currentUserId={user.id} />
        </div>
      </aside>
    </div>
  );
}
