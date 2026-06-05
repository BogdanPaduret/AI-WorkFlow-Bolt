import { Plus, Trash2, Workflow } from 'lucide-react';
import type { Node, Edge } from '@xyflow/react';
import { NODE_TYPES } from '../nodeTypes';

type SidebarProps = {
  nodes: Node[];
  edges: Edge[];
  onAddNode: (nodeType: string) => void;
  onClearAll: () => void;
};

export default function Sidebar({ nodes, edges, onAddNode, onClearAll }: SidebarProps) {
  const typeEntries = Object.values(NODE_TYPES);

  return (
    <aside className="wf-sidebar">
      {/* Brand */}
      <div className="wf-sidebar-brand">
        <div className="wf-sidebar-logo">
          <Workflow size={18} style={{ color: '#fff' }} />
        </div>
        <div>
          <h1 className="wf-sidebar-title">Workflow Builder</h1>
          <p className="wf-sidebar-subtitle">Visual canvas editor</p>
        </div>
      </div>

      {/* Add Nodes */}
      <div className="wf-sidebar-section">
        <p className="wf-section-label">Add Node</p>
        <div className="wf-add-group">
          {typeEntries.map(({ nodeType, label, icon: Icon, color }) => (
            <button
              key={nodeType}
              onClick={() => onAddNode(nodeType)}
              className="wf-add-type-btn"
              onMouseEnter={(e) => { e.currentTarget.style.background = `${color}12`; e.currentTarget.style.borderColor = `${color}50`; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#2a2e3b'; }}
            >
              <div className="wf-add-type-icon" style={{ background: `${color}15` }}>
                <Icon size={15} style={{ color }} />
              </div>
              <span className="wf-add-type-label">{label}</span>
              <Plus size={14} style={{ color: '#52525b', marginLeft: 'auto' }} />
            </button>
          ))}
        </div>
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
