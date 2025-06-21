import { MessageSquare } from "lucide-react";

export function MessagesTab() {
  return (
    <div className="fixed right-5 bottom-0 w-80 rounded-t-lg border bg-white shadow-lg">
      <div className="flex cursor-pointer items-center justify-between p-3">
        <h2 className="font-bold">Messages</h2>
        <MessageSquare />
      </div>
    </div>
  );
}
