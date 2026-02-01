export type IdeaStatus = 'draft' | 'refined' | 'archived';

export interface Idea {
  id: string;                    // UUID
  title: string;
  createdAt: string;              // ISO 8601
  updatedAt: string;              // ISO 8601
  tags: string[];
  status: IdeaStatus;
  summary: string;                // Short summary
  reportMd: string;               // Markdown report
  reportJson: IdeaReport | null;  // Structured JSON report
  syncedAt: string | null;        // For future cloud sync
}

export interface ChatMessage {
  id: string;                    // UUID
  ideaId: string;                // Foreign key
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;              // ISO 8601
}

export interface IdeaReport {
  pitch: {
    title: string;
    oneLiner: string;
  };
  problem: {
    statement: string;
    whyNow: string;
  };
  audience: {
    personas: Array<{
      name: string;
      description: string;
      painPoints: string[];
    }>;
  };
  solution: {
    description: string;
    differentiators: string[];
  };
  features: {
    mvp: string[];
    later: string[];
  };
  architecture: {
    overview: string;
    components: string[];
  };
  dataModel: {
    entities: Array<{
      name: string;
      fields: Array<{ name: string; type: string }>;
    }>;
    relations: string[];
  };
  roadmap: {
    phases: Array<{
      name: string;
      duration: string;
      deliverables: string[];
    }>;
  };
  risks: {
    items: Array<{
      risk: string;
      mitigation: string;
    }>;
  };
  checklist: {
    security: string[];
    privacy: string[];
    cost: string[];
  };
}
