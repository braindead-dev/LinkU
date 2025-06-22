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
import { useRouter } from "next/navigation";

const TABS = ["All", "Bot", "Inbox"] as const;
type Tab = (typeof TABS)[number];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ActivityTabsProps {
  profile?: Profile | null;
}

interface ActivityItem {
  id: string;
  type:
    | "bot_conversation"
    | "bot_summary"
    | "like"
    | "follow"
    | "message"
    | "reply";
  user_id?: string;
  user?: Profile;
  content?: string;
  post_content?: string;
  timestamp: string;
  read: boolean;
  // Navigation data
  post_id?: string;
  parent_post_id?: string;
  // AI-specific data
  highlighted_person?: string;
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
    case "reply":
      return <MessageSquareText className="h-8 w-8 text-blue-500" />;
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
const ActivityCard: FC<{ item: ActivityItem; activeTab: Tab }> = ({
  item,
  activeTab,
}) => {
  const router = useRouter();

  const handleCardClick = () => {
    switch (item.type) {
      case "like":
        if (item.post_id) {
          router.push(`/post/${item.post_id}`);
        }
        break;
      case "follow":
        if (item.user?.username) {
          router.push(`/${item.user.username}`);
        }
        break;
      case "message":
        // Navigate to messages page - you might want to specify the conversation
        router.push(`/messages`);
        break;
      case "reply":
        if (item.parent_post_id) {
          router.push(`/post/${item.parent_post_id}`);
        }
        break;
      default:
        // For bot activities, don't navigate
        break;
    }
  };

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
        const personName = item.highlighted_person || "someone";
        return renderBotActivity(`New conversation with ${personName}`);

      case "bot_summary":
        return renderBotActivity("AI Interaction Summary");

      case "like":
        return renderUserActivity(<>liked your post</>);

      case "follow":
        return renderUserActivity("started following you");

      case "message":
        return renderUserActivity("sent you a message");

      case "reply":
        return renderUserActivity("replied to your post");

      default:
        return null;
    }
  };

  const isBotActivity =
    item.type === "bot_conversation" || item.type === "bot_summary";
  const shouldHighlight = activeTab === "All" && isBotActivity;
  const isClickable = ["like", "follow", "message", "reply"].includes(
    item.type,
  );

  return (
    <div
      className={`border-b border-gray-100 p-4 transition-colors ${
        !shouldHighlight && "hover:bg-gray-50"
      } dark:border-neutral-800 dark:hover:bg-neutral-900 ${
        shouldHighlight
          ? "bg-blue-50 hover:bg-sky-50 dark:bg-blue-950/20 dark:hover:bg-blue-950/30"
          : ""
      } ${isClickable ? "cursor-pointer" : ""}`}
      onClick={isClickable ? handleCardClick : undefined}
    >
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

/**
 * ActivityTabs – renders tab navigation and activity content.
 */
const ActivityTabs: FC<ActivityTabsProps> = () => {
  const [active, setActive] = useState<Tab>(TABS[0]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClient();

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("Current user detected:", user?.id);
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, [supabase]);

  // Fetch likes on user's posts
  const fetchLikes = async (userId: string): Promise<ActivityItem[]> => {
    try {
      const { data, error } = await supabase
        .from("likes")
        .select(
          `
          id,
          created_at,
          user_id,
          post_id,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url
          ),
          posts!inner(
            content,
            user_id
          )
        `,
        )
        .eq("posts.user_id", userId)
        .neq("user_id", userId) // Don't show own likes
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map((like: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const likeData = like as any;
        return {
          id: `like-${likeData.id}`,
          type: "like" as const,
          user_id: likeData.user_id,
          user: likeData.profiles,
          post_content: likeData.posts.content,
          timestamp: likeData.created_at,
          read: false,
          post_id: likeData.post_id,
        };
      });
    } catch (error) {
      console.error("Error fetching likes:", error);
      return [];
    }
  };

  // Fetch new followers
  const fetchFollows = async (userId: string): Promise<ActivityItem[]> => {
    try {
      const { data, error } = await supabase
        .from("following")
        .select(
          `
          id,
          created_at,
          follower_id,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url
          )
        `,
        )
        .eq("following_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map((follow: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const followData = follow as any;
        return {
          id: `follow-${followData.id}`,
          type: "follow" as const,
          user_id: followData.follower_id,
          user: followData.profiles,
          timestamp: followData.created_at,
          read: false,
        };
      });
    } catch (error) {
      console.error("Error fetching follows:", error);
      return [];
    }
  };

  // Fetch messages sent to user
  const fetchMessages = async (userId: string): Promise<ActivityItem[]> => {
    try {
      // Get date from one week ago
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data, error } = await supabase
        .from("user_messages")
        .select(
          `
          id,
          content,
          created_at,
          read,
          sender_id,
          profiles!sender_id(
            id,
            username,
            full_name,
            avatar_url
          )
        `,
        )
        .eq("recipient_id", userId)
        .eq("read", false) // Only unread messages
        .gte("created_at", oneWeekAgo.toISOString()) // Only from last week
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }

      console.log(
        "Fetched messages for user:",
        userId,
        "Count:",
        data?.length || 0,
      );
      if (data && data.length > 0) {
        console.log("Sample message:", data[0]);
      }

      return (data || []).map((message: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const messageData = message as any;
        return {
          id: `message-${messageData.id}`,
          type: "message" as const,
          user_id: messageData.sender_id,
          user: messageData.profiles,
          content: messageData.content,
          timestamp: messageData.created_at,
          read: messageData.read,
        };
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
  };

  // Fetch replies to user's posts
  const fetchReplies = async (userId: string): Promise<ActivityItem[]> => {
    try {
      // First get user's posts
      const { data: userPosts, error: postsError } = await supabase
        .from("posts")
        .select("id")
        .eq("user_id", userId);

      if (postsError) throw postsError;
      if (!userPosts || userPosts.length === 0) return [];

      const postIds = userPosts.map((post) => post.id);

      // Then get replies to those posts
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          id,
          content,
          created_at,
          user_id,
          parent_post_id,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url
          ),
          parent_post:posts!parent_post_id(
            content
          )
        `,
        )
        .in("parent_post_id", postIds)
        .neq("user_id", userId) // Don't show own replies
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map((reply: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const replyData = reply as any;
        return {
          id: `reply-${replyData.id}`,
          type: "reply" as const,
          user_id: replyData.user_id,
          user: replyData.profiles,
          content: replyData.content,
          post_content: replyData.parent_post?.content,
          timestamp: replyData.created_at,
          read: false,
          parent_post_id: replyData.parent_post_id,
        };
      });
    } catch (error) {
      console.error("Error fetching replies:", error);
      return [];
    }
  };

  // Fetch AI-generated activities (replaces generateBotActivities)
  const fetchAIActivities = async (userId: string): Promise<ActivityItem[]> => {
    try {
      // Get date from 24 hours ago
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      // Fetch AI-generated messages from the past 24 hours
      const { data: aiMessages, error: messagesError } = await supabase
        .from("user_messages")
        .select(
          `
          id,
          content,
          created_at,
          profiles!recipient_id(
            username,
            full_name
          )
        `,
        )
        .eq("sender_id", userId)
        .eq("is_ai_generated", true)
        .gte("created_at", twentyFourHoursAgo.toISOString())
        .order("created_at", { ascending: false });

      if (messagesError) {
        console.error("Error fetching AI messages:", messagesError);
      }

      // Fetch AI-generated posts from the past 24 hours
      const { data: aiPosts, error: postsError } = await supabase
        .from("posts")
        .select("id, content, created_at")
        .eq("user_id", userId)
        .eq("is_ai_generated", true)
        .gte("created_at", twentyFourHoursAgo.toISOString())
        .order("created_at", { ascending: false });

      if (postsError) {
        console.error("Error fetching AI posts:", postsError);
      }

      console.log("AI Messages found:", aiMessages?.length || 0);
      console.log("AI Posts found:", aiPosts?.length || 0);

      // If no AI content, return empty array
      if (
        (!aiMessages || aiMessages.length === 0) &&
        (!aiPosts || aiPosts.length === 0)
      ) {
        return [];
      }

      // Prepare data for OpenAI analysis
      const messagesForAnalysis = (aiMessages || []).map((msg: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const msgData = msg as any;
        return {
          content: msgData.content,
          recipient_name:
            msgData.profiles?.full_name ||
            msgData.profiles?.username ||
            "Unknown",
          created_at: msgData.created_at,
        };
      });

      const postsForAnalysis = (aiPosts || []).map((post: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const postData = post as any;
        return {
          content: postData.content,
          created_at: postData.created_at,
        };
      });

      // Call OpenAI API to generate summaries
      const response = await fetch("/api/ai-activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messagesForAnalysis,
          posts: postsForAnalysis,
        }),
      });

      if (!response.ok) {
        console.error("Failed to get AI activity analysis");
        return [];
      }

      const analysis = await response.json();
      console.log("AI Activity Analysis:", analysis);

      const activities: ActivityItem[] = [];

      // Create "New conversation" notification if there's a highlighted person
      if (analysis.highlighted_person && analysis.brief_summary) {
        activities.push({
          id: "ai-conversation-1",
          type: "bot_conversation",
          content: analysis.brief_summary,
          highlighted_person: analysis.highlighted_person,
          timestamp: new Date().toISOString(), // Use current time for the notification
          read: false,
        });
      }

      // Create "AI Interaction Summary" notification
      if (analysis.overall_summary) {
        activities.push({
          id: "ai-summary-1",
          type: "bot_summary",
          content: analysis.overall_summary,
          timestamp: new Date().toISOString(), // Use current time for the notification
          read: false,
        });
      }

      return activities;
    } catch (error) {
      console.error("Error fetching AI activities:", error);
      return [];
    }
  };

  // Load all activities
  useEffect(() => {
    const loadActivities = async () => {
      if (!currentUserId) {
        console.log("No current user ID, skipping activity load");
        return;
      }

      try {
        setLoading(true);
        console.log("Loading activities for user:", currentUserId);

        // Debug: Check total messages for this user (all messages, not just unread)
        const { data: allMessages } = await supabase
          .from("user_messages")
          .select("id, read, created_at")
          .eq("recipient_id", currentUserId);
        console.log("Total messages for user:", allMessages?.length || 0);
        console.log("All messages:", allMessages);

        // Fetch all types of activities in parallel
        const [likes, follows, messages, replies] = await Promise.all([
          fetchLikes(currentUserId),
          fetchFollows(currentUserId),
          fetchMessages(currentUserId),
          fetchReplies(currentUserId),
        ]);

        console.log(
          "Activity counts - Likes:",
          likes.length,
          "Follows:",
          follows.length,
          "Messages:",
          messages.length,
          "Replies:",
          replies.length,
        );

        // Fetch AI-generated activities
        const aiActivities = await fetchAIActivities(currentUserId);

        // Combine with other activities
        const allActivities = [
          ...likes,
          ...follows,
          ...messages,
          ...replies,
          ...aiActivities,
        ];

        // Sort by timestamp
        allActivities.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );

        setActivities(allActivities);
      } catch (error) {
        console.error("Error loading activities:", error);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [currentUserId, supabase]);

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
            item.type === "message" ||
            item.type === "reply",
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
            "No notifications yet. Likes, follows, messages, and replies will appear here."}
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
