"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TextEffect } from "@/components/ui/text-effect";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { motion } from "motion/react";
import { Database } from "@/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"] & {
  core_memories?: string | null;
};

type ProfileAnalysis = {
  introversion_extraversion: number;
  analytical_creative: number;
  cooperative_competitive: number;
  spontaneous_methodical: number;
  reserved_expressive: number;
  tags: string[];
  bio: string;
};

type AIAnalysisModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  profile: Profile | null;
};

export default function AIAnalysisModal({
  isOpen,
  onOpenChange,
  profile,
}: AIAnalysisModalProps) {
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && profile?.core_memories && !analysis && !loading) {
      const fetchAnalysis = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch("/api/analyze", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ core_memories: profile.core_memories }),
          });
          if (!response.ok) {
            throw new Error("Failed to fetch analysis");
          }
          const data = await response.json();
          setAnalysis(data);
        } catch (err) {
          setError(
            "Could not load analysis. The user may not have provided enough information.",
          );
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchAnalysis();
    } else if (isOpen && !profile?.core_memories) {
      setError(
        "Could not load analysis. The user may not have provided enough information.",
      );
    }
  }, [isOpen, profile, analysis, loading]);

  if (!profile) return null;

  const personalityTraits = analysis
    ? [
        {
          leftLabel: "Introversion",
          rightLabel: "Extraversion",
          value: analysis.introversion_extraversion,
          color: "bg-blue-500",
        },
        {
          leftLabel: "Analytical",
          rightLabel: "Creative",
          value: analysis.analytical_creative,
          color: "bg-green-500",
        },
        {
          leftLabel: "Cooperative",
          rightLabel: "Competitive",
          value: analysis.cooperative_competitive,
          color: "bg-purple-500",
        },
        {
          leftLabel: "Spontaneous",
          rightLabel: "Methodical",
          value: analysis.spontaneous_methodical,
          color: "bg-orange-500",
        },
        {
          leftLabel: "Reserved",
          rightLabel: "Expressive",
          value: analysis.reserved_expressive,
          color: "bg-pink-500",
        },
      ]
    : [];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          setAnalysis(null);
          setError(null);
        }
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Profile Analysis
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex h-64 items-center justify-center">
            <TextShimmer className="text-md font-mono" duration={1}>
              Analyzing...
            </TextShimmer>
          </div>
        )}

        {error && !loading && (
          <div className="flex h-64 items-center justify-center text-center">
            <p className="text-neutral-500">{error}</p>
          </div>
        )}

        {!loading && !error && analysis && (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0 }}
            >
              <h3 className="mb-4 text-lg font-semibold">Personality</h3>
              <div className="space-y-2">
                {personalityTraits.map((trait) => (
                  <PersonalityTrait key={trait.leftLabel} {...trait} />
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <h3 className="mb-3 text-lg font-semibold">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-neutral-100 px-3 py-1 text-sm dark:bg-neutral-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.2 }}
            >
              <h3 className="mb-3 text-lg font-semibold">Biography</h3>
              <TextEffect 
                per="char" 
                preset="fade" 
                speedReveal={3}
                className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400"
                delay={0.2}
              >
                {analysis.bio}
              </TextEffect>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.3}}
            >
              <Button
                onClick={() => {
                  onOpenChange(false);
                }}
                className="w-full border-2 border-neutral-600 bg-neutral-900 text-white hover:cursor-pointer hover:bg-neutral-800"
                size="lg"
              >
                Reach Out
              </Button>
            </motion.div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PersonalityTrait({
  leftLabel,
  rightLabel,
  value,
  color,
}: {
  leftLabel: string;
  rightLabel: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-24 text-right text-sm text-neutral-600 dark:text-neutral-400">
        {leftLabel}
      </span>
      <div className="relative flex-1">
        <div className="h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700">
          <div
            className={`h-1.5 ${color} rounded-full`}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
      <span className="w-24 text-sm text-neutral-600 dark:text-neutral-400">
        {rightLabel}
      </span>
    </div>
  );
}
