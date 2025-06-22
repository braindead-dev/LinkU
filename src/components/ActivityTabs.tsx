"use client";
import { FC, useState, useEffect } from "react";
import { Database } from "@/types/database.types";
import {
  Bot,
  Heart,
  User,
  MessageSquare,
  MessageSquareText,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

const TABS = ["All", "Bot", "Inbox"] as const;
type Tab = (typeof TABS)[number];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ActivityTabsProps {
  profile?: Profile | null;
}

interface ActivityItem {
  id: string;
  type: "bot_conversation" | "bot_summary" | "like" | "follow" | "message";
  user_id?: string;
  user?: Profile;
  content?: string;
  post_content?: string;
  timestamp: string;
  read: boolean;
}

/**
 * TabNav – internal component for switching between activity tabs.
 */
const TabNav: FC<{
  tabs: readonly Tab[];
  active: string;
  onChange: (t: Tab) => void;
}> = ({ tabs, active, onChange }) => (
  <nav className="sticky top-0 z-10 flex border-b border-gray-100 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-black/80">
    {tabs.map((tab) => (
      <button
        key={tab}
        onClick={() => onChange(tab)}
        className={`flex-1 py-4 font-medium transition-colors hover:bg-gray-50 dark:hover:bg-neutral-900 ${
          active === tab ? "border-b-2 border-blue-500" : "text-gray-500"
        }`}
      >
        {tab}
      </button>
    ))}
  </nav>
);

/**
 * ActivityIcon – renders the appropriate icon for each activity type
 */
const ActivityIcon: FC<{ type: ActivityItem["type"] }> = ({ type }) => {
  switch (type) {
    case "bot_conversation":
      return <MessageSquareText className="h-8 w-8 text-neutral-700" />;
    case "bot_summary":
      return <Bot className="h-8 w-8 text-neutral-700" />;
    case "like":
      return <Heart className="h-8 w-8 text-red-500" />;
    case "follow":
      return <User className="h-8 w-8 text-green-500" />;
    case "message":
      return <MessageSquare className="h-8 w-8 text-blue-500" />;
    default:
      return <Bot className="h-8 w-8 text-gray-500" />;
  }
};

/**
 * ActivityHeader – renders the header with title and timestamp
 */
const ActivityHeader: FC<{
  title: React.ReactNode;
  timestamp: string;
}> = ({ title, timestamp }) => (
  <div className="flex items-center justify-between">
    <p className="font-medium">{title}</p>
    <p className="text-sm font-medium text-gray-500">{formatTime(timestamp)}</p>
  </div>
);

/**
 * ActivityContent – renders the content below the header
 */
const ActivityContent: FC<{
  content?: string;
  postContent?: string;
}> = ({ content, postContent }) => (
  <>
    {content && <p className="text-sm text-gray-600">{content}</p>}
    {postContent && (
      <p className="text-sm text-gray-600">&ldquo;{postContent}&rdquo;</p>
    )}
  </>
);

/**
 * ActivityCard – renders an individual activity item
 */
const ActivityCard: FC<{ item: ActivityItem; activeTab: Tab }> = ({ item, activeTab }) => {
  const renderUserActivity = (actionText: React.ReactNode) => (
    <div className="flex items-center gap-3">
      <Link href={`/${item.user?.username}`}>
        <Avatar className="h-10 w-10 cursor-pointer">
          <AvatarImage src={item.user?.avatar_url || undefined} />
          <AvatarFallback>
            {item.user?.full_name?.charAt(0) || item.user?.username.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1">
        <ActivityHeader
          title={
            <>
              <Link
                href={`/${item.user?.username}`}
                className="font-semibold hover:underline"
              >
                {item.user?.full_name || item.user?.username}
              </Link>{" "}
              {actionText}
            </>
          }
          timestamp={item.timestamp}
        />
        <ActivityContent
          content={item.content}
          postContent={item.post_content}
        />
      </div>
    </div>
  );

  const renderBotActivity = (title: string) => (
    <div className="flex items-center gap-3">
      <ActivityIcon type={item.type} />
      <div className="flex-1">
        <ActivityHeader title={title} timestamp={item.timestamp} />
        <ActivityContent content={item.content} />
      </div>
    </div>
  );

  const getContent = () => {
    switch (item.type) {
      case "bot_conversation":
        return renderBotActivity("New conversation with Karthik");

      case "bot_summary":
        return renderBotActivity("AI Interaction Summary");

      case "like":
        return renderUserActivity(<>liked your post</>);

      case "follow":
        return renderUserActivity("started following you");

      case "message":
        return renderUserActivity("sent you a message");

      default:
        return null;
    }
  };

  const isBotActivity = item.type === "bot_conversation" || item.type === "bot_summary";
  const shouldHighlight = activeTab === "All" && isBotActivity;

  return (
    <div className={`border-b border-gray-100 p-4 transition-colors ${!shouldHighlight && 'hover:bg-gray-50'} dark:border-neutral-800 dark:hover:bg-neutral-900 ${
      shouldHighlight ? "bg-blue-50 hover:bg-sky-50 dark:bg-blue-950/20 dark:hover:bg-blue-950/30" : ""
    }`}>
      {getContent()}
    </div>
  );
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
  if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d`;
  return date.toLocaleDateString();
};

// Dummy data with real user IDs - replace these with actual user IDs from your database
const generateDummyActivities = (): ActivityItem[] => [
  {
    id: "1",
    type: "bot_conversation",
    content:
      "You discussed startup insights and Lebron James with a potential founder",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6h ago
    read: false,
  },
  {
    id: "2",
    type: "like",
    user_id: "5e0d694e-ac79-4411-9cbd-c5b12aa1c0c6",
    post_content: "The OG founder incubator was Minecraft factions",
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10h ago
    read: false,
  },
  {
    id: "3",
    type: "bot_summary",
    content: "You had 3 conversations today about AI and Calhacks",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12h ago
    read: true,
  },
  {
    id: "4",
    type: "follow",
    user_id: "61b72fbb-4126-4f1c-9b65-d9e52083eb8a",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1d ago
    read: true,
  },
  {
    id: "5",
    type: "message",
    user_id: "d0429f15-b888-41dd-8418-034697f204c6",
    content: "Hey! Love your recent post about startup ideas",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2d ago
    read: true,
  },
];

/**
 * ActivityTabs – renders tab navigation and activity content.
 */
const ActivityTabs: FC<ActivityTabsProps> = () => {
  const [active, setActive] = useState<Tab>(TABS[0]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Fetch user data for activities that have user_ids
  const fetchUserData = async (activities: ActivityItem[]) => {
    const userIds = activities
      .filter((activity) => activity.user_id)
      .map((activity) => activity.user_id);

    if (userIds.length === 0) return activities;

    try {
      const { data: users, error } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);

      if (error) {
        console.error("Error fetching user data:", error);
        return activities;
      }

      // Map user data to activities
      return activities.map((activity) => {
        if (activity.user_id) {
          const user = users?.find((u) => u.id === activity.user_id);
          return { ...activity, user };
        }
        return activity;
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      return activities;
    }
  };

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const dummyActivities = generateDummyActivities();
        const activitiesWithUsers = await fetchUserData(dummyActivities);
        setActivities(activitiesWithUsers);
      } catch (error) {
        console.error("Error loading activities:", error);
        setActivities(generateDummyActivities());
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [supabase]);

  const getFilteredActivities = () => {
    switch (active) {
      case "Bot":
        return activities.filter(
          (item) =>
            item.type === "bot_conversation" || item.type === "bot_summary",
        );
      case "Inbox":
        return activities.filter(
          (item) =>
            item.type === "like" ||
            item.type === "follow" ||
            item.type === "message",
        );
      default:
        return activities;
    }
  };

  const filteredActivities = getFilteredActivities();

  return (
    <section>
      <div className="border-b border-gray-100 p-4 dark:border-neutral-800">
        <h1 className="text-2xl font-bold">Activity</h1>
      </div>

      <TabNav tabs={TABS} active={active} onChange={setActive} />

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading activity...</div>
      ) : filteredActivities.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          {active === "Bot" &&
            "No AI activity yet. Your AI will appear here when it has conversations."}
          {active === "Inbox" &&
            "No notifications yet. Likes, follows, and messages will appear here."}
          {active === "All" && "No activity yet."}
        </div>
      ) : (
        <div>
          {filteredActivities.map((item) => (
            <ActivityCard key={item.id} item={item} activeTab={active} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ActivityTabs;
