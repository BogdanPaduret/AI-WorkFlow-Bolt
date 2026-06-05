import { Plus, Trash2, Workflow } from 'lucide-react';
import type { Node, Edge } from '@xyflow/react';

type SidebarProps = {
  nodes: Node[];
  edges: Edge[];
  onAddNode: () => void;
  onClearAll: () => void;
};

export default function Sidebar({ nodes, edges, onAddNode, onClearAll }: SidebarProps) {
  return (
    <aside className="wf-sidebar">
      {/* Logo */}
      <div className="wf-sidebar-brand">
        <div className="wf-sidebar-logo">
          <Workflow size={18} style={{ color: '#fff' }} />
        </div>
        <div>
          <h1 className="wf-sidebar-title">Workflow Builder</h1>
          <p className="wf-sidebar-subtitle">Visual canvas editor</p>
        </div>
      </div>

      {/* Add Node */}
      <div className="wf-sidebar-section">
        <button onClick={onAddNode} className="wf-add-btn">
          <Plus size={18} />
          <span>Add Node</span>
        </button>
      </div>

      {/* Stats */}
      <div className="wf-sidebar-section">
        <p className="wf-section-label">Stats</p>
        <div className="wf-stat-row">
          <span className="wf-stat-key">Nodes</span>
          <span className="wf-stat-val wf-stat-blue">{nodes.length}</span>
        </div>
        <div className="wf-stat-row">
          <span className="wf-stat-key">Connections</span>
          <span className="wf-stat-val wf-stat-teal">{edges.length}</span>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      {nodes.length > 0 && (
        <div className="wf-sidebar-actions">
          <button onClick={onClearAll} className="wf-clear-btn">
            <Trash2 size={14} />
            Clear All
          </button>
        </div>
      )}
    </aside>
  );
}
