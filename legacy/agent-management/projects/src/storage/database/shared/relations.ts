import { relations } from "drizzle-orm/relations";
import {
  agents,
  conversationBoxes,
  conversationBoxAgents,
  conversationBoxMessages,
  conversationBoxAgentResponses,
} from "./schema";

export const conversationBoxesRelations = relations(conversationBoxes, ({ many }) => ({
  agents: many(conversationBoxAgents),
  messages: many(conversationBoxMessages),
}));

export const conversationBoxAgentsRelations = relations(conversationBoxAgents, ({ one }) => ({
  box: one(conversationBoxes, {
    fields: [conversationBoxAgents.boxId],
    references: [conversationBoxes.id],
  }),
  agent: one(agents, {
    fields: [conversationBoxAgents.agentId],
    references: [agents.id],
  }),
}));

export const conversationBoxMessagesRelations = relations(conversationBoxMessages, ({ one, many }) => ({
  box: one(conversationBoxes, {
    fields: [conversationBoxMessages.boxId],
    references: [conversationBoxes.id],
  }),
  senderAgent: one(agents, {
    fields: [conversationBoxMessages.senderAgentId],
    references: [agents.id],
  }),
  responses: many(conversationBoxAgentResponses),
}));

export const conversationBoxAgentResponsesRelations = relations(conversationBoxAgentResponses, ({ one }) => ({
  message: one(conversationBoxMessages, {
    fields: [conversationBoxAgentResponses.messageId],
    references: [conversationBoxMessages.id],
  }),
  agent: one(agents, {
    fields: [conversationBoxAgentResponses.agentId],
    references: [agents.id],
  }),
}));

