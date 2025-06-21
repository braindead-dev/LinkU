import Sidebar from "@/components/Sidebar";
import TimelineTabs from "@/components/TimelineTabs";
import SearchBar from "@/components/SearchBar";
import MessagesTab from "@/components/MessagesTab";

export default function Home() {
  return (
    <div className="flex max-w-7xl mx-auto">
      <Sidebar />

      {/* Feed */}
      <main className="flex-1 min-h-screen border-x border-gray-200 dark:border-neutral-800">
        <TimelineTabs />
      </main>

      {/* Right column */}
      <aside className="hidden xl:block w-96">
        <SearchBar />
      </aside>

      <MessagesTab />
    </div>
  );
}
