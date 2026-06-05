import {
  MessageSquare,
  FileText,
  Database,
} from 'lucide-react';

export type InputConfig = {
  text: string;
};

export type PromptConfig = {
  text: string;
};

export type OutputConfig = {
  output: string;
};

export type NodeConfig =
  | InputConfig
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
  input: {
    nodeType: 'input',
    label: 'Input',
    icon: Database,
    color: '#f97316',
    defaultConfig: {
      text: '',
    },
  },

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