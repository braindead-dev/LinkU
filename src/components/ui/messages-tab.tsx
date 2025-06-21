import { MessageSquare } from 'lucide-react';

export function MessagesTab() {
  return (
    <div className="fixed bottom-0 right-5 bg-white w-80 rounded-t-lg shadow-lg border">
      <div className="flex justify-between items-center p-3 cursor-pointer">
        <h2 className="font-bold">Messages</h2>
        <MessageSquare />
      </div>
    </div>
  );
} 