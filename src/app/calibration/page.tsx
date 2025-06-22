"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function CalibrationPage() {
  const [profile, setProfile] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<
    { from: "bot" | "user"; text: string }[]
  >([
    {
      from: "bot",
      text: "Welcome to Linku! Before you get started, let's calibrate your agent. Tell me a bit about your interests or what you want your agent to focus on.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profile);
      setLoading(false);
    }
    fetchProfile();
  }, [supabase, router]);

  // Auto-scroll when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    const userId = profile?.id;
    if (!text || !userId) return;
    setSending(true);

    setMessages((prev) => [...prev, { from: "user", text }]);

    try {
      const res = await fetch(`http://localhost:3001/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message: text }),
      });
      const payload = await res.json();

      const botText =
        typeof payload.reply === "string"
          ? payload.reply
          : payload.error || "Oops, no response.";

      // If bot returns "<end>", show ending message and redirect to home
      if (botText.trim() === "<end>") {
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: "ending conversation...." },
        ]);
        setInput("");
        setSending(false);
        setTimeout(() => {
          router.push("/");
        }, 1500); // 1.5 seconds delay before redirect
        return;
      }

      setMessages((prev) => [...prev, { from: "bot", text: botText }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Sorry, could not reach the server." },
      ]);
    } finally {
      setInput("");
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-black">
      <div className="mb-4">
        <Image
          src="/logo.png"
          alt="Linku Logo"
          width={120}
          height={40}
          priority
        />
      </div>

      <div className="flex w-full max-w-lg flex-col gap-4 rounded-xl bg-white p-8 shadow-lg dark:bg-neutral-900">
        <h2 className="mb-2 text-center text-2xl font-bold">
          Hey! Who are you?
        </h2>

        <div
          className="mb-4 flex max-h-96 min-h-[10rem] flex-col gap-2 overflow-y-auto transition-all"
          style={{ height: "28rem" }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`rounded-lg px-4 py-2 text-sm ${
                msg.from === "bot"
                  ? "self-start bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200"
                  : "self-end bg-gray-100 text-gray-900 dark:bg-neutral-800 dark:text-gray-100"
              }`}
            >
              <span className="mr-2 font-semibold">
                {msg.from === "bot" ? "Linku Bot:" : "You:"}
              </span>
              {msg.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-neutral-800"
            placeholder="Type your response..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            autoFocus
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="rounded-full bg-blue-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
