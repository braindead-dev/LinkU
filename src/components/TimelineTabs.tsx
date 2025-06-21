'use client';
import { FC, useState } from "react";
import PostComposer from "@/components/PostComposer";
import PostCard from "@/components/PostCard";
import { Database } from "@/types/database.types";

const TABS = ["For you", "Following"] as const;
type Tab = typeof TABS[number];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface TimelineTabsProps {
  profile?: Profile | null;
}

/**
 * TabNav – internal component for switching between timeline tabs.
 */
const TabNav: FC<{
  tabs: readonly Tab[];
  active: string;
  onChange: (t: Tab) => void;
}> = ({ tabs, active, onChange }) => (
  <nav className="flex border-b border-gray-200 dark:border-neutral-800 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur">
    {tabs.map((tab) => (
      <button
        key={tab}
        onClick={() => onChange(tab)}
        className={`flex-1 py-4 font-medium hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors ${
          active === tab ? "border-b-2 border-blue-500" : "text-gray-500"
        }`}
      >
        {tab}
      </button>
    ))}
  </nav>
);

/**
 * TimelineTabs – renders tab navigation and timeline content.
 */
const TimelineTabs: FC<TimelineTabsProps> = ({ profile }) => {
  const [active, setActive] = useState<Tab>(TABS[0]);

  return (
    <section>
      <TabNav tabs={TABS} active={active} onChange={setActive} />
      <PostComposer profile={profile} />
      {[...Array(3)].map((_, idx) => (
        <PostCard
          key={idx}
          name="Theo - t3.gg"
          handle="theo"
          content="The M4 Mac Mini is currently on sale for $465? That's one of the best computer deals I've seen in my entire life wtf"
        />
      ))}
    </section>
  );
};

export default TimelineTabs; 