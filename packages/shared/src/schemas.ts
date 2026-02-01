import { z } from 'zod';

export const IdeaReportSchema = z.object({
  pitch: z.object({
    title: z.string(),
    oneLiner: z.string(),
  }),
  problem: z.object({
    statement: z.string(),
    whyNow: z.string(),
  }),
  audience: z.object({
    personas: z.array(z.object({
      name: z.string(),
      description: z.string(),
      painPoints: z.array(z.string()),
    })),
  }),
  solution: z.object({
    description: z.string(),
    differentiators: z.array(z.string()),
  }),
  features: z.object({
    mvp: z.array(z.string()),
    later: z.array(z.string()),
  }),
  architecture: z.object({
    overview: z.string(),
    components: z.array(z.string()),
  }),
  dataModel: z.object({
    entities: z.array(z.object({
      name: z.string(),
      fields: z.array(z.object({
        name: z.string(),
        type: z.string(),
      })),
    })),
    relations: z.array(z.string()),
  }),
  roadmap: z.object({
    phases: z.array(z.object({
      name: z.string(),
      duration: z.string(),
      deliverables: z.array(z.string()),
    })),
  }),
  risks: z.object({
    items: z.array(z.object({
      risk: z.string(),
      mitigation: z.string(),
    })),
  }),
  checklist: z.object({
    security: z.array(z.string()),
    privacy: z.array(z.string()),
    cost: z.array(z.string()),
  }),
});

export const IdeaSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  tags: z.array(z.string()),
  status: z.enum(['draft', 'refined', 'archived']),
  summary: z.string(),
  reportMd: z.string(),
  reportJson: IdeaReportSchema.nullable(),
  syncedAt: z.string().nullable(),
});

export const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  ideaId: z.string().uuid(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.string(),
});
