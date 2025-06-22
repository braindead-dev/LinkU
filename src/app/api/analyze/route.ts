import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { core_memories } = await req.json();

    if (!core_memories) {
      return NextResponse.json(
        { error: "core_memories is required" },
        { status: 400 },
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const response = await openai.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "You are an Analysis bot. You will be fed in a detailed description of a person, and you are to assign accurate spectrum values based on your insights, as well as 3 topic interest tags, as well as a short bio about the person (1-2 short sentences max). The description will be provided in the following message.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `${core_memories}`,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "personality_scores",
          strict: true,
          schema: {
            type: "object",
            properties: {
              introversion_extraversion: {
                type: "number",
                description:
                  "Score representing the balance between introversion (0) and extraversion (100).",
                minimum: 0,
                maximum: 100,
              },
              analytical_creative: {
                type: "number",
                description:
                  "Score representing the balance between analytical (0) and creative (100) thinking.",
                minimum: 0,
                maximum: 100,
              },
              cooperative_competitive: {
                type: "number",
                description:
                  "Score representing the balance between cooperative (0) and competitive (100) tendencies.",
                minimum: 0,
                maximum: 100,
              },
              spontaneous_methodical: {
                type: "number",
                description:
                  "Score representing the balance between spontaneous (0) and methodical (100) approaches.",
                minimum: 0,
                maximum: 100,
              },
              reserved_expressive: {
                type: "number",
                description:
                  "Score representing the balance between reserved (0) and expressive (100) behavior.",
                minimum: 0,
                maximum: 100,
              },
              tags: {
                type: "array",
                description: "A list of topics the person is interested in.",
                items: {
                  type: "string",
                },
              },
              bio: {
                type: "string",
                description: "A short biography about the person.",
              },
            },
            required: [
              "introversion_extraversion",
              "analytical_creative",
              "cooperative_competitive",
              "spontaneous_methodical",
              "reserved_expressive",
              "tags",
              "bio",
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

    console.log("OpenAI Response:", JSON.stringify(response, null, 2));
    console.log("Response output_text:", response.output_text);

    const analysis = JSON.parse(response.output_text || "{}");
    console.log("Parsed analysis:", analysis);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error analyzing profile:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "No stack trace",
    });
    return NextResponse.json(
      { error: "Failed to analyze profile" },
      { status: 500 },
    );
  }
}
