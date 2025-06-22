import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import PostDetail from "@/components/PostDetail";
import Sidebar from "@/components/Sidebar";
import { getUnreadConversationsCount } from "@/utils/unreadCount";

type PostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PostPage({ params }: PostPageProps) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get the post with author info
  const { data: post, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles (*)
    `,
    )
    .eq("id", id)
    .single();

  if (error || !post) {
    notFound();
  }

  // Get current user's profile
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get unread count for sidebar
  const unreadCount = await getUnreadConversationsCount(user.id);

  return (
    <div className="mx-auto flex max-w-7xl">
      <Sidebar profile={currentProfile} unreadCount={unreadCount} />

      <main className="min-h-screen flex-1 border-x border-gray-100 dark:border-neutral-800">
        <PostDetail
          post={post}
          currentUserId={user.id}
          currentProfile={currentProfile}
        />
      </main>
    </div>
  );
}
