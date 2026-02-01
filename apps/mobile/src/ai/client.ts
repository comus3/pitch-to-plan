// AI client wrapper for OpenAI API

import OpenAI from 'openai';
import { IdeaReportSchema } from '../../../packages/shared/src/schemas';

export interface AIClientConfig {
  apiKey?: string;
  model?: string;
  maxRetries?: number;
  retryDelay?: number;
}

export class AIClient {
  private client: OpenAI | null = null;
  private config: Required<AIClientConfig>;

  constructor(config: AIClientConfig = {}) {
    this.config = {
      model: 'gpt-4',
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };

    if (config.apiKey) {
      this.client = new OpenAI({
        apiKey: config.apiKey,
      });
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async retry<T>(
    fn: () => Promise<T>,
    retries: number = this.config.maxRetries
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 0) {
        throw error;
      }

      // Exponential backoff
      const delay = this.config.retryDelay * (this.config.maxRetries - retries + 1);
      await this.sleep(delay);
      return this.retry(fn, retries - 1);
    }
  }

  async chat(messages: Array<{ role: string; content: string }>): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI API key not configured. Please set EXPO_PUBLIC_OPENAI_API_KEY environment variable.');
    }

    return this.retry(async () => {
      try {
        const response = await this.client!.chat.completions.create({
          model: this.config.model,
          messages: messages.map((msg) => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content,
          })),
          temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('Empty response from OpenAI');
        }

        return content;
      } catch (error) {
        if (error instanceof Error) {
          // Handle rate limiting
          if (error.message.includes('rate limit')) {
            throw new Error('Rate limit exceeded. Please try again later.');
          }
          // Handle API errors
          if (error.message.includes('API key')) {
            throw new Error('Invalid API key. Please check your configuration.');
          }
        }
        throw error;
      }
    });
  }

  async generateReport(chatHistory: Array<{ role: string; content: string }>): Promise<{
    reportMd: string;
    reportJson: unknown;
  }> {
    if (!this.client) {
      throw new Error('OpenAI API key not configured. Please set EXPO_PUBLIC_OPENAI_API_KEY environment variable.');
    }

    return this.retry(async () => {
      try {
        // Use structured output to get JSON
        const response = await this.client!.chat.completions.create({
          model: this.config.model,
          messages: [
            ...chatHistory,
            {
              role: 'system',
              content: 'You are a product strategist. Generate a structured report in JSON format matching the IdeaReport schema. Also provide a markdown version of the report.',
            },
            {
              role: 'user',
              content: 'Generate the final report in JSON format. The JSON must match the IdeaReport schema exactly. Also provide a markdown version.',
            },
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('Empty response from OpenAI');
        }

        // Parse JSON response
        let parsedJson: any;
        try {
          parsedJson = JSON.parse(content);
        } catch (parseError) {
          // Try to extract JSON from markdown code blocks
          const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            parsedJson = JSON.parse(jsonMatch[1]);
          } else {
            throw new Error('Failed to parse JSON response');
          }
        }

        // Validate with Zod schema
        const validated = IdeaReportSchema.parse(parsedJson);

        // Generate markdown version
        const reportMd = this.generateMarkdownFromReport(validated);

        return {
          reportMd,
          reportJson: validated,
        };
      } catch (error) {
        if (error instanceof Error) {
          // Handle validation errors
          if (error.message.includes('parse')) {
            throw new Error('Invalid JSON response from AI. Please try again.');
          }
        }
        throw error;
      }
    });
  }

  private generateMarkdownFromReport(report: any): string {
    // Convert structured report to markdown
    let md = `# ${report.pitch.title}\n\n`;
    md += `**${report.pitch.oneLiner}**\n\n`;

    md += `## Problem\n\n`;
    md += `${report.problem.statement}\n\n`;
    md += `**Why Now:** ${report.problem.whyNow}\n\n`;

    md += `## Audience\n\n`;
    report.audience.personas.forEach((persona: any) => {
      md += `### ${persona.name}\n\n`;
      md += `${persona.description}\n\n`;
      md += `**Pain Points:**\n`;
      persona.painPoints.forEach((point: string) => {
        md += `- ${point}\n`;
      });
      md += `\n`;
    });

    md += `## Solution\n\n`;
    md += `${report.solution.description}\n\n`;
    md += `**Differentiators:**\n`;
    report.solution.differentiators.forEach((diff: string) => {
      md += `- ${diff}\n`;
    });
    md += `\n`;

    md += `## Features\n\n`;
    md += `### MVP\n`;
    report.features.mvp.forEach((feature: string) => {
      md += `- ${feature}\n`;
    });
    md += `\n### Later\n`;
    report.features.later.forEach((feature: string) => {
      md += `- ${feature}\n`;
    });
    md += `\n`;

    md += `## Architecture\n\n`;
    md += `${report.architecture.overview}\n\n`;
    md += `**Components:**\n`;
    report.architecture.components.forEach((component: string) => {
      md += `- ${component}\n`;
    });
    md += `\n`;

    md += `## Data Model\n\n`;
    report.dataModel.entities.forEach((entity: any) => {
      md += `### ${entity.name}\n`;
      entity.fields.forEach((field: any) => {
        md += `- ${field.name}: ${field.type}\n`;
      });
      md += `\n`;
    });

    md += `## Roadmap\n\n`;
    report.roadmap.phases.forEach((phase: any) => {
      md += `### ${phase.name} (${phase.duration})\n`;
      phase.deliverables.forEach((deliverable: string) => {
        md += `- ${deliverable}\n`;
      });
      md += `\n`;
    });

    md += `## Risks\n\n`;
    report.risks.items.forEach((risk: any) => {
      md += `### ${risk.risk}\n`;
      md += `**Mitigation:** ${risk.mitigation}\n\n`;
    });

    md += `## Checklist\n\n`;
    md += `### Security\n`;
    report.checklist.security.forEach((item: string) => {
      md += `- [ ] ${item}\n`;
    });
    md += `\n### Privacy\n`;
    report.checklist.privacy.forEach((item: string) => {
      md += `- [ ] ${item}\n`;
    });
    md += `\n### Cost\n`;
    report.checklist.cost.forEach((item: string) => {
      md += `- [ ] ${item}\n`;
    });

    return md;
  }
}
