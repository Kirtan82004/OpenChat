import OpenAI from "openai";
import Filter from "bad-words";

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

// Profanity filter instance
const filter = new Filter();

export async function POST(request) {
  try {
    const body = await request.json();
    const userMessage = body.message?.trim();

    // 1. Empty check
    if (!userMessage) {
      return new Response(JSON.stringify({ error: "Message cannot be empty." }), {
        status: 400,
      });
    }

    // 2. Profanity / bad words check
    if (filter.isProfane(userMessage)) {
      return new Response(JSON.stringify({ error: "Inappropriate content detected." }), {
        status: 400,
      });
    }

    // 3. Send to Gemini
    const completion = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: userMessage }]
    });

    return Response.json(
      {
        response: completion.choices[0].message.content
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Gemini API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to complete the request." }),
      { status: 500 }
    );
  }
}
