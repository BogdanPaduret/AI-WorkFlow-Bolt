import { memo, useCallback, useRef, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { GripVertical, Trash2 } from 'lucide-react';
import { NODE_TYPES, type WorkflowNodeData, type PromptConfig, type OutputConfig } from '../nodeTypes';

function WorkflowNode({ id, data }: NodeProps) {
  const d = data as unknown as WorkflowNodeData;
  const def = NODE_TYPES[d.nodeType] || NODE_TYPES.prompt;
  const Icon = def.icon;
  const color = def.color;

  const [editingLabel, setEditingLabel] = useState(false);
  const [editingBody, setEditingBody] = useState(false);
  const labelRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const startEditLabel = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLabel(true);
    setTimeout(() => labelRef.current?.focus(), 0);
  }, []);

  const startEditBody = useCallback(() => {
    setEditingBody(true);
    setTimeout(() => bodyRef.current?.focus(), 0);
  }, []);

  const updateLabel = useCallback(
    (label: string) => d.onUpdate(id, { label }),
    [d, id],
  );

  const updateConfig = useCallback(
    (patch: Record<string, string>) => {
      d.onUpdate(id, { config: { ...d.config, ...patch } });
    },
    [d, id],
  );

  const bodyPlaceholder = d.nodeType === 'output' ? 'Enter output...' : 'Write a prompt...';
  const bodyValue = d.nodeType === 'output'
    ? (d.config as OutputConfig).output
    : (d.config as PromptConfig).text;
  const bodyKey = d.nodeType === 'output' ? 'output' : 'text';

  return (
    <div className="wf-node" onDoubleClick={startEditBody}>
      {/* Header */}
      <div className="wf-node-header" style={{ background: `linear-gradient(135deg, ${color}06, ${color}12)` }}>
        <GripVertical size={14} className="wf-drag-handle react-flow__drag-handle" />
        <div className="wf-node-type-icon" style={{ background: `${color}18` }}>
          <Icon size={13} style={{ color }} />
        </div>
        {editingLabel ? (
          <input
            ref={labelRef}
            defaultValue={d.label as string}
            onBlur={() => setEditingLabel(false)}
            onKeyDown={(e) => { if (e.key === 'Enter') setEditingLabel(false); }}
            onChange={(e) => updateLabel(e.target.value)}
            className="wf-label-input"
            style={{ color }}
          />
        ) : (
          <span className="wf-node-title" style={{ color }} onDoubleClick={startEditLabel}>
            {d.label as string}
          </span>
        )}
        <span className="wf-node-badge" style={{ background: `${color}14`, color: `${color}cc` }}>
          {def.label}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); d.onDelete(id); }}
          className="wf-delete-btn"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Body */}
      <div className="wf-node-body">
        {editingBody ? (
          <textarea
            ref={bodyRef}
            defaultValue={bodyValue}
            onBlur={() => setEditingBody(false)}
            onChange={(e) => updateConfig({ [bodyKey]: e.target.value })}
            className="wf-textarea"
            placeholder={bodyPlaceholder}
            rows={3}
          />
        ) : (
          <p className="wf-node-text" style={{ color: bodyValue ? '#e4e4e7' : '#3f3f46' }}>
            {bodyValue || 'Double-click to edit...'}
          </p>
        )}
      </div>

      <Handle type="target" position={Position.Top} className="wf-handle" style={{ borderColor: `${color}80`, background: `${color}30` }} />
      <Handle type="source" position={Position.Bottom} className="wf-handle" style={{ borderColor: `${color}80`, background: `${color}30` }} />
    </div>
  );
}

export default memo(WorkflowNode);
