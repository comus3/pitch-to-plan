// Prompt builders for AI interview and report generation

export interface InterviewContext {
  ideaTitle?: string;
  previousMessages: Array<{ role: string; content: string }>;
}

export function buildInterviewPrompt(context: InterviewContext): string {
  const ideaTitle = context.ideaTitle || 'a new idea';
  
  return `You are a product strategist helping to refine an idea. Your goal is to ask clarifying questions and challenge assumptions to help the user develop a well-thought-out product plan.

The user is working on: ${ideaTitle}

Guidelines:
- Ask one question at a time
- Be concise and focused
- Challenge assumptions when appropriate
- Cover these areas: problem statement, target audience, solution approach, MVP scope, constraints, and risks
- Be conversational and helpful, not interrogative
- Build on previous answers to go deeper

Previous conversation:
${context.previousMessages.map((msg: { role: string; content: string }) => `${msg.role}: ${msg.content}`).join('\n')}

Ask your next question to help refine this idea.`;
}

export function buildReportPrompt(chatHistory: Array<{ role: string; content: string }>): string {
  return `You are a product strategist. Based on the following conversation, generate a comprehensive structured report.

The report should include:
1. Pitch: title and one-liner
2. Problem: statement and why now
3. Audience: personas with descriptions and pain points
4. Solution: description and differentiators
5. Features: MVP features vs later features
6. Architecture: overview and components
7. Data Model: entities with fields and relations
8. Roadmap: phases with duration and deliverables
9. Risks: items with mitigations
10. Checklist: security, privacy, and cost considerations

Conversation history:
${chatHistory.map((msg: { role: string; content: string }) => `${msg.role}: ${msg.content}`).join('\n\n')}

Generate a complete, actionable report in JSON format matching the IdeaReport schema. Be specific and practical.`;
}
