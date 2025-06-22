import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import SuggestedUsers from "@/components/SuggestedUsers";
import { getUnreadConversationsCount } from "@/utils/unreadCount";
import Image from "next/image";

export default async function NotFound() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    redirect("/login");
  }

  // Fetch user profile
  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // If profile doesn't exist, create one
  if (!profile && user.email) {
    const baseUsername =
      user.user_metadata?.username || user.email.split("@")[0];
    const fullName = user.user_metadata?.full_name || "";

    // Try to create profile with base username
    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        username: baseUsername,
        full_name: fullName,
      })
      .select()
      .single();

    // If username already exists, try with a random suffix
    if (createError?.code === "23505") {
      // Unique violation
      const uniqueUsername = `${baseUsername}_${Math.floor(Math.random() * 10000)}`;
      const { data: retryProfile, error: retryError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          username: uniqueUsername,
          full_name: fullName,
        })
        .select()
        .single();

      if (!retryError) {
        profile = retryProfile;
      } else {
        console.error(
          "Error creating profile with unique username:",
          retryError,
        );
      }
    } else if (!createError) {
      profile = newProfile;
    } else {
      console.error("Error creating profile:", createError);
    }
  }

  // Get unread conversations count
  const unreadCount = await getUnreadConversationsCount(user.id);

  return (
    <div className="mx-auto flex max-w-7xl">
      <Sidebar profile={profile} unreadCount={unreadCount} />

      {/* Feed */}
      <main className="min-h-screen flex-1 border-x border-gray-100 pb-24 dark:border-neutral-800">
        <div className="flex h-full flex-col items-center justify-center">
          <Image
            src="/square_logo.png"
            alt="Logo"
            width={100}
            height={100}
            className="mb-8 h-auto"
          />
          <h1 className="mb-2 text-2xl font-bold">404 - Page Not Found</h1>
          <p className="text-neutral-500">
            The page you are looking for does not exist.
          </p>
        </div>
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
