import { useState, useMemo } from "react";
import { Send, CheckCheck } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ClientMessagesTabProps {
  clientName: string;
  advisorName?: string;
}

const ClientMessagesTab = ({ clientName, advisorName = "Your Adviser" }: ClientMessagesTabProps) => {
  const [message, setMessage] = useState("");
  const firstName = clientName.split(" ")[0];

  const messages = useMemo(() => [
    { id: 1, from: "adviser", text: `Hi ${firstName}, just a reminder about your annual review next Thursday at 10am. Would that still work for you?`, time: "9:15 AM", date: "Today" },
    { id: 2, from: "client", text: "Hi! Yes, that works perfectly. Should I prepare anything specific?", time: "9:22 AM", date: "Today" },
    { id: 3, from: "adviser", text: "Great! I'll send over a brief questionnaire beforehand. We'll review your portfolio performance and discuss any changes to your goals.", time: "9:25 AM", date: "Today" },
    { id: 4, from: "client", text: "Sounds good, looking forward to it.", time: "9:28 AM", date: "Today" },
    { id: 5, from: "adviser", text: "Also, I noticed your risk cover is due for renewal next month. We should discuss that during our meeting as well.", time: "9:35 AM", date: "Today" },
  ], [firstName]);

  return (
    <div className="flex flex-col h-full">
      {/* Adviser header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <div className="h-9 w-9 rounded-full bg-[hsl(220,60%,50%)] flex items-center justify-center text-white text-xs font-bold shrink-0">
          A
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{advisorName}</p>
          <p className="text-[10px] text-emerald-500">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.from === "client" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                msg.from === "client"
                  ? "bg-[hsl(220,60%,50%)] text-white rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm"
              }`}
            >
              <p className="text-xs leading-relaxed">{msg.text}</p>
              <div className={`flex items-center gap-1 mt-1 ${msg.from === "client" ? "justify-end" : ""}`}>
                <span className={`text-[9px] ${msg.from === "client" ? "text-white/60" : "text-muted-foreground"}`}>
                  {msg.time}
                </span>
                {msg.from === "client" && <CheckCheck className="h-2.5 w-2.5 text-white/60" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="px-3 py-2 border-t border-border flex items-center gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="h-9 text-sm flex-1 rounded-full"
        />
        <button className="h-9 w-9 rounded-full bg-[hsl(220,60%,50%)] flex items-center justify-center text-white shrink-0">
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ClientMessagesTab;
