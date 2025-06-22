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

    // Combine messages and posts into a single text for analysis
    let inputText = "AI-generated content from the past 24 hours:\n\n";

    if (messages && messages.length > 0) {
      inputText += "MESSAGES:\n";
      messages.forEach((msg, index) => {
        inputText += `${index + 1}. To ${msg.recipient_name}: "${msg.content}"\n`;
      });
      inputText += "\n";
    }

    if (posts && posts.length > 0) {
      inputText += "POSTS:\n";
      posts.forEach((post, index) => {
        inputText += `${index + 1}. "${post.content}"\n`;
      });
    }

    const response = await openai.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: 'Your job is to return the name of someone the user had a standout / highlight conversation with from the messages (ex. "Karthik"), and also give a short super summary of what they talked about (ex. "You discussed startup insights and Lebron James with a potential founder").\n\nAlso, give a short overall summary of all the user interactions from the ones provided (ex. "You had 3 conversations today about AI and Calhacks and argued with 2 people in comment sections")\n\nIf there are no meaningful interactions, return empty strings for highlighted_person and brief_summary, and a simple summary for overall_summary.',
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: inputText,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "highlight_conversations",
          strict: true,
          schema: {
            type: "object",
            properties: {
              highlighted_person: {
                type: "string",
                description:
                  "The name of the person involved in a standout conversation.",
              },
              brief_summary: {
                type: "string",
                description:
                  "A short summary of what was discussed in the standout conversation.",
              },
              overall_summary: {
                type: "string",
                description:
                  "A short overall summary of all user interactions based on provided messages.",
              },
            },
            required: [
              "highlighted_person",
              "brief_summary",
              "overall_summary",
            ],
            additionalProperties: false,
          },
        },
      },
      reasoning: {},
      tools: [],
      temperature: 1,
      max_output_tokens: 2048,
      top_p: 1,
      store: true,
    });

    console.log(
      "OpenAI AI Activity Response:",
      JSON.stringify(response, null, 2),
    );
    console.log("Response output_text:", response.output_text);

    const analysis = JSON.parse(response.output_text || "{}");
    console.log("Parsed AI activity analysis:", analysis);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error analyzing AI activity:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "No stack trace",
    });
    return NextResponse.json(
      { error: "Failed to analyze AI activity" },
      { status: 500 },
    );
  }
}
