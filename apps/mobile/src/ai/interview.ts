// Interview orchestration logic

import { ChatMessage, IdeaReport } from '../types';
import { AIClient } from './client';
import { buildInterviewPrompt, buildReportPrompt } from './prompts';

export interface InterviewContext {
  ideaTitle?: string;
  previousMessages: Array<{ role: string; content: string }>;
}

export interface InterviewState {
  ideaId: string;
  messages: ChatMessage[];
  isComplete: boolean;
}

export class InterviewOrchestrator {
  private aiClient: AIClient;

  constructor(aiClient: AIClient) {
    this.aiClient = aiClient;
  }

  async processMessage(
    state: InterviewState,
    userMessage: string
  ): Promise<{ response: string; state: InterviewState }> {
    // Add user message to state
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      ideaId: state.ideaId,
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...state.messages, userMsg];

    // Build prompt with context
    const prompt = buildInterviewPrompt({
      ideaTitle: state.ideaId, // Could extract from first message
      previousMessages: updatedMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    // Get AI response
    const aiResponse = await this.aiClient.chat([
      { role: 'system', content: prompt },
      ...updatedMessages.slice(-5).map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ]);

    // Add AI response to state
    const aiMsg: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      ideaId: state.ideaId,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
    };

    const finalMessages = [...updatedMessages, aiMsg];

    return {
      response: aiResponse,
      state: {
        ...state,
        messages: finalMessages,
        isComplete: false,
      },
    };
  }

  async generateReport(state: InterviewState): Promise<IdeaReport> {
    const chatHistory = state.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const prompt = buildReportPrompt(chatHistory);

    const result = await this.aiClient.generateReport([
      { role: 'system', content: prompt },
      ...chatHistory,
    ]);

    return result.reportJson as IdeaReport;
  }
}
