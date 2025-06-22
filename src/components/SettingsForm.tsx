"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface SettingsFormProps {
  profile: Profile;
}

export default function SettingsForm({ profile }: SettingsFormProps) {
  const [postFrequency, setPostFrequency] = useState(
    profile.post_frequency_per_day || 1,
  );
  const [connectFrequency, setConnectFrequency] = useState(
    profile.connect_frequency_per_day || 1,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          post_frequency_per_day: postFrequency,
          connect_frequency_per_day: connectFrequency,
        })
        .eq("id", profile.id);

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating settings:", err);
      setError("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-200">
          Settings updated successfully!
        </div>
      )}

      <div>
        <label
          htmlFor="postFrequency"
          className="mb-4 block text-lg font-medium"
        >
          Post Frequency Per Day
        </label>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="range"
              id="postFrequency"
              min="1"
              max="20"
              value={postFrequency}
              onChange={(e) => setPostFrequency(Number(e.target.value))}
              className="slider h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-neutral-700"
            />
            <input
              type="number"
              min="1"
              value={postFrequency}
              onChange={(e) => setPostFrequency(Number(e.target.value))}
              className="w-20 rounded-md border border-gray-300 px-3 py-2 text-center focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <p className="text-sm text-gray-500">
            How many posts you want to make per day (1-20 on slider, higher
            values available via input)
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="connectFrequency"
          className="mb-4 block text-lg font-medium"
        >
          Connect Frequency Per Day
        </label>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="range"
              id="connectFrequency"
              min="1"
              max="20"
              value={connectFrequency}
              onChange={(e) => setConnectFrequency(Number(e.target.value))}
              className="slider h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-neutral-700"
            />
            <input
              type="number"
              min="1"
              value={connectFrequency}
              onChange={(e) => setConnectFrequency(Number(e.target.value))}
              className="w-20 rounded-md border border-gray-300 px-3 py-2 text-center focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <p className="text-sm text-gray-500">
            How many connections you want to make per day (1-20 on slider,
            higher values available via input)
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-gray-300 px-6 py-2 font-semibold transition-colors hover:bg-gray-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          Cancel
        </button>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
          background: #e5e7eb;
        }

        .dark .slider::-webkit-slider-track {
          background: #374151;
        }

        .slider::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: #e5e7eb;
          border: none;
        }

        .dark .slider::-moz-range-track {
          background: #374151;
        }
      `}</style>
    </form>
  );
}
