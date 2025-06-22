import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import SuggestedUsers from "@/components/SuggestedUsers";
import ProfilePage from "@/components/ProfilePage";
import { getUnreadConversationsCount } from "@/utils/unreadCount";

type PageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const supabase = await createClient();
  const { username } = await params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentUserProfile = null;
  let unreadCount = 0;

  if (user) {
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    currentUserProfile = currentProfile;
    unreadCount = await getUnreadConversationsCount(user.id);
  }

  return (
    <div className="mx-auto flex max-w-7xl">
      <Sidebar profile={currentUserProfile} unreadCount={unreadCount} />

      <main className="min-h-screen flex-1 border-x border-gray-200 dark:border-neutral-800">
        <ProfilePage params={Promise.resolve({ username })} />
      </main>

      <aside className="hidden w-96 space-y-4 xl:block">
        <SearchBar />
        <div className="px-4">
          <SuggestedUsers currentUserId={user?.id} />
        </div>
      </aside>
    </div>
  );
}
