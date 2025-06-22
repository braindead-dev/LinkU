import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

interface AIMessage {
  content: string;
  recipient_name: string;
  created_at: string;
}

interface AIPost {
  content: string;
  created_at: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages, posts }: { messages?: AIMessage[]; posts?: AIPost[] } =
      await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 },
      );
    }

    // If no AI-generated content, return empty summaries
    if (
      (!messages || messages.length === 0) &&
      (!posts || posts.length === 0)
    ) {
      return NextResponse.json({
        highlighted_person: "",
        brief_summary: "",
        overall_summary: "No AI interactions found today.",
      });
    }

    // Limit the number of items to analyze
    const maxMessages = 10;
    const maxPosts = 10;
    const limitedMessages = messages?.slice(0, maxMessages) || [];
    const limitedPosts = posts?.slice(0, maxPosts) || [];

    // Combine messages and posts into a single text for analysis
    let inputText = "AI-generated content from the past 24 hours:\n\n";

    if (limitedMessages.length > 0) {
      inputText += "MESSAGES:\n";
      limitedMessages.forEach((msg, index) => {
        // Ensure content is truncated (should already be from frontend)
        const truncatedContent = msg.content.slice(0, 150);
        inputText += `${index + 1}. To ${msg.recipient_name}: "${truncatedContent}"\n`;
      });
      inputText += "\n";
    }

    if (limitedPosts.length > 0) {
      inputText += "POSTS:\n";
      limitedPosts.forEach((post, index) => {
        // Ensure content is truncated (should already be from frontend)
        const truncatedContent = post.content.slice(0, 150);
        inputText += `${index + 1}. "${truncatedContent}"\n`;
      });
    }

    // Limit total input text length as a safety measure
    if (inputText.length > 3000) {
      inputText = inputText.slice(0, 3000) + "...\n[Content truncated]";
    }

    console.log("Input text length:", inputText.length);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Your job is to analyze AI-generated content and provide:\n1. The name of someone the user had a standout/highlight conversation with (if any)\n2. A brief summary of what they talked about\n3. An overall summary of all AI interactions\n\nRespond in JSON format with keys: highlighted_person, brief_summary, overall_summary",
        },
        {
          role: "user",
          content: inputText,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 500,
    });

    console.log("OpenAI response received");

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    const analysis = JSON.parse(content);
    console.log("Parsed AI activity analysis:", analysis);

    // Ensure all required fields exist
    const result = {
      highlighted_person: analysis.highlighted_person || "",
      brief_summary: analysis.brief_summary || "",
      overall_summary:
        analysis.overall_summary || "Summary of your AI interactions today.",
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error analyzing AI activity:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "No stack trace",
    });

    // Return a default response instead of erroring out
    return NextResponse.json({
      highlighted_person: "",
      brief_summary: "",
      overall_summary: "Unable to generate AI activity summary at this time.",
    });
  }
}
