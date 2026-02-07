import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { isDatabaseConfigured, getDb } from "@/lib/db";

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

async function readChatsFromFile(): Promise<ChatsData> {
  try {
    const raw = await fs.readFile(CHATS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function readChatsFromDatabase(storySlug?: string): Promise<ChatsData | ChatMessage[]> {
  const sql = getDb();
  
  if (storySlug) {
    const rows = await sql`
      SELECT message_id, story_slug, name, message, created_at, reactions, reply_to, status, moderated
      FROM chat_messages
      WHERE story_slug = ${storySlug}
      ORDER BY created_at DESC
    `;
    return rows.map((r: any) => ({
      id: r.message_id,
      storySlug: r.story_slug,
      name: r.name,
      message: r.message,
      at: r.created_at,
      reactions: r.reactions || {},
      replyTo: r.reply_to,
      status: r.status,
      moderated: Boolean(r.moderated)
    }));
  }
  
  const rows = await sql`
    SELECT message_id, story_slug, name, message, created_at, reactions, reply_to, status, moderated
    FROM chat_messages
    ORDER BY created_at DESC
  `;
  
  const chats: ChatsData = {};
  rows.forEach((r: any) => {
    if (!chats[r.story_slug]) {
      chats[r.story_slug] = [];
    }
    chats[r.story_slug].push({
      id: r.message_id,
      storySlug: r.story_slug,
      name: r.name,
      message: r.message,
      at: r.created_at,
      reactions: r.reactions || {},
      replyTo: r.reply_to,
      status: r.status,
      moderated: Boolean(r.moderated)
    });
  });
  
  return chats;
}

async function writeChatsToFile(data: ChatsData): Promise<void> {
  await fs.writeFile(CHATS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const storySlug = searchParams.get("storySlug");

  if (isDatabaseConfigured()) {
    try {
      const data = await readChatsFromDatabase(storySlug || undefined);
      return NextResponse.json(data);
    } catch (error) {
      console.error('Database read failed, falling back to file system:', error);
    }
  }

  const chats = await readChatsFromFile();

  if (storySlug) {
    return NextResponse.json(chats[storySlug] || []);
  }

  return NextResponse.json(chats);
}

export async function POST(request: Request) {
  try {
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

    // Try database first if configured
    if (isDatabaseConfigured()) {
      try {
        const sql = getDb();
        
        await sql`
          INSERT INTO chat_messages (message_id, story_slug, name, message, created_at, reactions, reply_to, status, moderated)
          VALUES (${chatMessage.id}, ${chatMessage.storySlug}, ${chatMessage.name}, ${chatMessage.message}, ${chatMessage.at}, ${chatMessage.reactions}, ${chatMessage.replyTo || null}, ${chatMessage.status}, ${chatMessage.moderated ?? false})
        `;
        
        return NextResponse.json({ ...chatMessage, storage: 'database' });
      } catch (dbError) {
        console.error('Database write failed, attempting file system:', dbError);
        // Fall through to file system
      }
    }
    
    // File system fallback
    const isProduction = process.env.VERCEL === "1";
    
    if (isProduction && !isDatabaseConfigured()) {
      return NextResponse.json(
        { 
          error: "Production filesystem is read-only",
          message: "Chat messages require Neon Postgres (DATABASE_URL) for production persistence."
        },
        { status: 403 }
      );
    }

    const chats = await readChatsFromFile();
    if (!chats[storySlug]) {
      chats[storySlug] = [];
    }

    chats[storySlug].unshift(chatMessage);
    chats[storySlug] = chats[storySlug].slice(0, 200);

    await writeChatsToFile(chats);

    return NextResponse.json({ ...chatMessage, storage: 'filesystem' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save message" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { storySlug, messageId, reaction } = body;

    if (!storySlug || !messageId || !reaction) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Try database first if configured
    if (isDatabaseConfigured()) {
      try {
        const sql = getDb();
        
        // Fetch the current message
        const messages = await sql`SELECT reactions FROM chat_messages WHERE message_id = ${messageId}`;
        if (messages.length === 0) {
          return NextResponse.json({ error: "Message not found" }, { status: 404 });
        }
        
        const currentReactions = messages[0].reactions || {};
        currentReactions[reaction] = (currentReactions[reaction] || 0) + 1;
        
        // Update the message with new reactions
        await sql`
          UPDATE chat_messages
          SET reactions = ${currentReactions}
          WHERE message_id = ${messageId}
        `;
        
        const updated = await sql`SELECT * FROM chat_messages WHERE message_id = ${messageId}`;
        
        return NextResponse.json({
          id: updated[0].message_id,
          storySlug: updated[0].story_slug,
          name: updated[0].name,
          message: updated[0].message,
          at: updated[0].created_at,
          reactions: updated[0].reactions,
          replyTo: updated[0].reply_to,
          status: updated[0].status,
          moderated: updated[0].moderated,
          storage: 'database'
        });
      } catch (dbError) {
        console.error('Database update failed, attempting file system:', dbError);
        // Fall through to file system
      }
    }
    
    // File system fallback
    const isProduction = process.env.VERCEL === "1";
    
    if (isProduction && !isDatabaseConfigured()) {
      return NextResponse.json(
        { 
          error: "Production filesystem is read-only",
          message: "Reactions require Neon Postgres (DATABASE_URL) for production persistence."
        },
        { status: 403 }
      );
    }

    const chats = await readChatsFromFile();
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

    await writeChatsToFile(chats);

    return NextResponse.json({ ...message, storage: 'filesystem' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update reaction" },
      { status: 500 }
    );
  }
}
