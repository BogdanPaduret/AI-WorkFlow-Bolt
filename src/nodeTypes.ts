import { MessageSquare, FileText } from 'lucide-react';

export type PromptConfig = {
  text: string;
};

export type OutputConfig = {
  output: string;
};

export type NodeConfig =
  | PromptConfig
  | OutputConfig;

export type WorkflowNodeData = {
  label: string;
  nodeType: string;
  config: NodeConfig;
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    patch: Partial<WorkflowNodeData>
  ) => void;
};

export type NodeTypeDefinition = {
  nodeType: string;
  label: string;
  icon: typeof MessageSquare;
  color: string;
  defaultConfig: NodeConfig;
};

export const NODE_TYPES: Record<
  string,
  NodeTypeDefinition
> = {
  prompt: {
    nodeType: 'prompt',
    label: 'Prompt',
    icon: MessageSquare,
    color: '#3b82f6',
    defaultConfig: {
      text: '',
    },
  },

  output: {
    nodeType: 'output',
    label: 'Output',
    icon: FileText,
    color: '#10b981',
    defaultConfig: {
      output: '',
    },
  },
};