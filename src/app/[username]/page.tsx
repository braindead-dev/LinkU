import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import MessagesTab from "@/components/MessagesTab";
import SuggestedUsers from "@/components/SuggestedUsers";
import ProfilePage from "@/components/ProfilePage";

type PageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto flex max-w-7xl">
      <Sidebar profile={profile} />

      <main className="min-h-screen flex-1 border-x border-gray-200 dark:border-neutral-800">
        <ProfilePage params={params} />
      </main>

      <aside className="hidden w-96 space-y-4 xl:block">
        <SearchBar />
        <div className="px-4">
          <SuggestedUsers currentUserId={user.id} />
        </div>
      </aside>

      <MessagesTab />
    </div>
  );
}
