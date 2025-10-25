import { Ollama } from "ollama";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { messages, systemPrompt } = await request.json();

    if (!process.env.OLLAMA_API_KEY) {
      return NextResponse.json(
        { error: "OLLAMA_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const ollama = new Ollama({
      host: "https://ollama.com",
      headers: {
        Authorization: "Bearer " + process.env.OLLAMA_API_KEY,
      },
    });

    // Use the provided system prompt or default
    const systemPromptObj = {
      role: "system",
      content: systemPrompt || "You are Cognix Assist, a helpful AI learning companion designed to help students understand complex topics, provide study insights, and assist with academic questions. Be clear, concise, and educational in your responses. Format your answers with proper markdown including code blocks, lists, and headings when appropriate."
    };

    // Create a ReadableStream for streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await ollama.chat({
            model: "gpt-oss:120b",
            messages: [
              systemPromptObj, // Add system prompt first
              ...messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
              }))
            ],
            stream: true,
          });

          for await (const part of response) {
            const text = part.message.content;
            controller.enqueue(new TextEncoder().encode(text));
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request", details: error.message },
      { status: 500 }
    );
  }
}