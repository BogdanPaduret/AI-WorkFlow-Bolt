import { memo, useCallback, useRef, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { GripVertical, Trash2, Square } from 'lucide-react';

export type WorkflowNodeData = {
  label: string;
  text: string;
  onDelete: (id: string) => void;
  onTextChange: (id: string, text: string) => void;
  onLabelChange: (id: string, label: string) => void;
};

function WorkflowNode({ id, data }: NodeProps) {
  const d = data as unknown as WorkflowNodeData;
  const [editingText, setEditingText] = useState(false);
  const [editingLabel, setEditingLabel] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const labelRef = useRef<HTMLInputElement>(null);

  const startEditText = useCallback(() => {
    setEditingText(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, []);

  const startEditLabel = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLabel(true);
    setTimeout(() => labelRef.current?.focus(), 0);
  }, []);

  return (
    <div
      className="wf-node"
      onDoubleClick={startEditText}
    >
      {/* Header */}
      <div className="wf-node-header">
        <GripVertical size={14} className="wf-drag-handle react-flow__drag-handle" />
        <Square size={14} className="wf-node-icon" />
        {editingLabel ? (
          <input
            ref={labelRef}
            defaultValue={d.label as string}
            onBlur={() => setEditingLabel(false)}
            onKeyDown={(e) => { if (e.key === 'Enter') setEditingLabel(false); }}
            onChange={(e) => d.onLabelChange(id, e.target.value)}
            className="wf-label-input"
          />
        ) : (
          <span className="wf-node-title" onDoubleClick={startEditLabel}>
            {d.label as string}
          </span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); d.onDelete(id); }}
          className="wf-delete-btn"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Body */}
      <div className="wf-node-body">
        {editingText ? (
          <textarea
            ref={textareaRef}
            defaultValue={d.text as string}
            onBlur={() => setEditingText(false)}
            onChange={(e) => d.onTextChange(id, e.target.value)}
            className="wf-textarea"
            placeholder="Write something..."
            rows={3}
          />
        ) : (
          <p className="wf-node-text">
            {(d.text as string) || 'Double-click to edit...'}
          </p>
        )}
      </div>

      <Handle type="target" position={Position.Top} className="wf-handle" />
      <Handle type="source" position={Position.Bottom} className="wf-handle" />
    </div>
  );
}

export default memo(WorkflowNode);
