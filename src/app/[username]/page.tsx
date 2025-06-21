import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import MessagesTab from "@/components/MessagesTab";
import SuggestedUsers from "@/components/SuggestedUsers";
import ProfilePage from '@/components/ProfilePage';

type PageProps = {
  params: {
    username: string;
  };
};

export default async function Page({ params }: PageProps) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="flex max-w-7xl mx-auto">
      <Sidebar profile={profile} />

      <main className="flex-1 min-h-screen border-x border-gray-200 dark:border-neutral-800">
        <ProfilePage params={params} />
      </main>

      <aside className="hidden xl:block w-96 space-y-4">
        <SearchBar />
        <div className="px-4">
          <SuggestedUsers currentUserId={user.id} />
        </div>
      </aside>

      <MessagesTab />
    </div>
  );
} 