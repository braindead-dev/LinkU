import { createClient } from "@/utils/supabase/server";

export async function getUnreadConversationsCount(
  userId: string,
): Promise<number> {
  const supabase = await createClient();

  try {
    // Get all messages involving the current user
    const { data: allMessages, error } = await supabase
      .from("user_messages")
      .select("*")
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Count conversations with unread messages
    const conversationMap = new Map<string, boolean>();

    allMessages?.forEach((message) => {
      const otherUserId =
        message.sender_id === userId ? message.recipient_id : message.sender_id;

      // If this conversation already has unread messages, skip
      if (conversationMap.has(otherUserId)) return;

      // Check if this message is unread and sent to the current user
      if (!message.read && message.recipient_id === userId) {
        conversationMap.set(otherUserId, true);
      }
    });

    return conversationMap.size;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
}
