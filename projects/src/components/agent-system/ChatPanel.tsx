"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  User,
  Loader2,
  Copy,
  Globe,
} from "lucide-react";
import type { Agent, AgentTask } from "@/lib/db";

interface ChatPanelProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onAgentSelect: (agent: Agent) => void;
  selectedTask?: AgentTask | null;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export default function ChatPanel({
  agents,
  selectedAgent,
  onAgentSelect,
  selectedTask,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedAgent || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/agent-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          message: input,
          taskId: selectedTask?.id,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      const assistantMessage: Message = {
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantContent += parsed.content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = assistantContent;
                  return newMessages;
                });
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: "发生错误，请重试",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeAgents = agents.filter((a) => a.isActive);

  if (!selectedAgent && activeAgents.length > 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>选择一个智能体开始对话</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {activeAgents.slice(0, 5).map((agent) => (
            <Button
              key={agent.id}
              variant="outline"
              size="sm"
              onClick={() => onAgentSelect(agent)}
            >
              {agent.name}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* 选择智能体 */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b">
        <Select
          value={selectedAgent?.id || ""}
          onValueChange={(value) => {
            const agent = agents.find((a) => a.id === value);
            if (agent) onAgentSelect(agent);
          }}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="选择智能体" />
          </SelectTrigger>
          <SelectContent>
            {activeAgents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                <div className="flex items-center gap-2">
                  <span>{agent.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {agent.role}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedAgent && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Badge variant="secondary">{selectedAgent.role}</Badge>
            {selectedAgent.department && (
              <span>· {selectedAgent.department}</span>
            )}
          </div>
        )}

        {selectedTask && (
          <div className="ml-auto">
            <Badge variant="outline">
              任务: {selectedTask.title}
            </Badge>
          </div>
        )}
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 && selectedAgent && (
          <div className="text-center py-8 text-slate-400">
            <p>开始与 {selectedAgent.name} 对话</p>
            <p className="text-sm mt-1">
              {selectedAgent.description || "输入问题获取专业建议"}
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 relative group ${
                message.role === "user"
                  ? "bg-purple-600 text-white"
                  : message.role === "system"
                  ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                  : "bg-slate-100 dark:bg-slate-800"
              }`}
            >
              <div className="whitespace-pre-wrap text-sm">
                {message.content}
              </div>

              {message.role === "assistant" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -right-2 -top-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleCopy(message.content, String(index))}
                >
                  <Copy
                    className={`h-3 w-3 ${
                      copiedId === String(index) ? "text-green-500" : ""
                    }`}
                  />
                </Button>
              )}
            </div>
          </div>
        ))}

        {loading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入消息..."
          className="min-h-[60px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || loading || !selectedAgent}
          className="h-auto"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
