import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from "@/components/Sidebar";
import TimelineTabs from "@/components/TimelineTabs";
import SearchBar from "@/components/SearchBar";
import MessagesTab from "@/components/MessagesTab";

export default async function Home() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="flex max-w-7xl mx-auto">
      <Sidebar profile={profile} />

      {/* Feed */}
      <main className="flex-1 min-h-screen border-x border-gray-200 dark:border-neutral-800">
        <TimelineTabs profile={profile} />
      </main>

      {/* Right column */}
      <aside className="hidden xl:block w-96">
        <SearchBar />
      </aside>

      <MessagesTab />
    </div>
  );
}
