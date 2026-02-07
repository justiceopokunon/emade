import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const CHATS_FILE = path.join(process.cwd(), "data", "chats.json");

interface ChatMessage {
  id: string;
  storySlug: string;
  name: string;
  message: string;
  at: string;
  reactions?: { [key: string]: number };
  replyTo?: string;
  moderated?: boolean;
  status?: "pending" | "approved" | "flagged";
}

interface ChatsData {
  [storySlug: string]: ChatMessage[];
}

async function readChats(): Promise<ChatsData> {
  try {
    const raw = await fs.readFile(CHATS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeChats(data: ChatsData): Promise<void> {
  await fs.writeFile(CHATS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const storySlug = searchParams.get("storySlug");

  const chats = await readChats();

  if (storySlug) {
    return NextResponse.json(chats[storySlug] || []);
  }

  return NextResponse.json(chats);
}

export async function POST(request: Request) {
  try {
    const isProduction = process.env.VERCEL === "1";
    
    if (isProduction) {
      return NextResponse.json(
        { 
          error: "Production filesystem is read-only",
          message: "Chat messages require Vercel KV or Postgres for production persistence."
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { storySlug, name, message, replyTo } = body;

    if (!storySlug || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const chatMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      storySlug,
      name: name?.trim() || "Anonymous",
      message: message.trim(),
      at: new Date().toISOString(),
      reactions: {},
      replyTo: replyTo || undefined,
      status: "approved",
      moderated: false,
    };

    const chats = await readChats();
    if (!chats[storySlug]) {
      chats[storySlug] = [];
    }

    chats[storySlug].unshift(chatMessage);
    chats[storySlug] = chats[storySlug].slice(0, 200);

    await writeChats(chats);

    return NextResponse.json(chatMessage);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save message" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const isProduction = process.env.VERCEL === "1";
    
    if (isProduction) {
      return NextResponse.json(
        { 
          error: "Production filesystem is read-only",
          message: "Reactions require Vercel KV or Postgres for production persistence."
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { storySlug, messageId, reaction } = body;

    if (!storySlug || !messageId || !reaction) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const chats = await readChats();
    const messages = chats[storySlug] || [];
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);

    if (messageIndex === -1) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const message = messages[messageIndex];
    if (!message.reactions) {
      message.reactions = {};
    }

    if (!message.reactions[reaction]) {
      message.reactions[reaction] = 0;
    }
    message.reactions[reaction] += 1;

    messages[messageIndex] = message;
    chats[storySlug] = messages;

    await writeChats(chats);

    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update reaction" },
      { status: 500 }
    );
  }
}
