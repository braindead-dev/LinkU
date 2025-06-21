'use client';
import { FC, useState } from "react";
import TweetComposer from "@/components/TweetComposer";
import TweetCard from "@/components/TweetCard";

/**
 * TabNav – internal component for switching between timeline tabs.
 */
const TabNav: FC<{
  tabs: readonly string[];
  active: string;
  onChange: (t: string) => void;
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
const TimelineTabs: FC = () => {
  const tabs = ["For you", "Following"] as const;
  const [active, setActive] = useState<typeof tabs[number]>(tabs[0]);

  return (
    <section>
      <TabNav tabs={tabs} active={active} onChange={setActive} />
      <TweetComposer />
      {[...Array(3)].map((_, idx) => (
        <TweetCard
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