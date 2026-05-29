import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const CONVERSATIONS = [
  {
    id: "shoprite",
    name: "Shoprite Nigeria",
    preview: "Your order for rice is ready for pickup",
    time: "2m ago",
    unread: 2,
  },
  {
    id: "jumia",
    name: "Jumia Support",
    preview: "Price drop alert on iPhone 14 Pro",
    time: "1h ago",
    unread: 0,
  },
  {
    id: "vendor",
    name: "AP Plaza Market",
    preview: "Thanks! We can deliver tomorrow.",
    time: "Yesterday",
    unread: 0,
  },
];

const MESSAGES = [
  { id: 1, from: "them", text: "Hi! Your rice (50kg) order is confirmed.", time: "10:02 AM" },
  { id: 2, from: "me", text: "Great, is pickup available today?", time: "10:05 AM" },
  { id: 3, from: "them", text: "Yes — ready after 2pm at our Lagos store.", time: "10:08 AM" },
  { id: 4, from: "them", text: "Your order for rice is ready for pickup", time: "10:30 AM" },
];

export default function Chat() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const activeChat = CONVERSATIONS.find((c) => c.id === activeId);

  if (activeId && activeChat) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setActiveId(null)}
            className="p-1.5 rounded-lg hover:bg-muted text-foreground"
            aria-label="Back to chats"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">
              {activeChat.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-foreground truncate">{activeChat.name}</p>
            <p className="text-xs text-muted-foreground">Usually replies within an hour</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {MESSAGES.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  msg.from === "me"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}
              >
                <p>{msg.text}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    msg.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        <form
          className="sticky bottom-0 p-3 border-t border-border bg-background flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setDraft("");
          }}
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!draft.trim()} aria-label="Send message">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Chats</h1>
          </div>

          {CONVERSATIONS.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No messages yet.</p>
          ) : (
            <ul className="space-y-1">
              {CONVERSATIONS.map((chat) => (
                <li key={chat.id}>
                  <button
                    type="button"
                    data-testid={`chat-${chat.id}`}
                    onClick={() => setActiveId(chat.id)}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-muted/80 transition-colors text-left"
                  >
                    <Avatar className="w-11 h-11 shrink-0">
                      <AvatarFallback className="bg-primary/15 text-primary text-sm font-bold">
                        {chat.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm text-foreground truncate">{chat.name}</p>
                        <span className="text-[11px] text-muted-foreground shrink-0">{chat.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{chat.preview}</p>
                    </div>
                    {chat.unread > 0 && (
                      <span className="shrink-0 min-w-[1.25rem] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center">
                        {chat.unread}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className="text-xs text-muted-foreground text-center mt-8">
            Message vendors about orders and price alerts.{" "}
            <Link href="/" className="text-primary hover:underline">
              Back to home
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
