import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  type Node,
  type Edge,
  type NodeTypes,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Sidebar from './components/Sidebar';
import WorkflowNode from './components/WorkflowNode';
import { useLocalStorage } from './hooks/useLocalStorage';
import { NODE_TYPES, type WorkflowNodeData } from './nodeTypes';

const nodeTypes: NodeTypes = { workflow: WorkflowNode };
const STORAGE_KEY = 'workflow-builder';

export default function App() {
  const [savedNodes, setSavedNodes] = useLocalStorage<Node[]>(`${STORAGE_KEY}-nodes`, []);
  const [savedEdges, setSavedEdges] = useLocalStorage<Edge[]>(`${STORAGE_KEY}-edges`, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(savedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(savedEdges);

  const persistNodes = useCallback(
    (ns: Node[]) => setSavedNodes(ns),
    [setSavedNodes],
  );
  const persistEdges = useCallback(
    (es: Edge[]) => setSavedEdges(es),
    [setSavedEdges],
  );

  const handleNodesChange: typeof onNodesChange = useCallback(
    (changes) => { onNodesChange(changes); setNodes((n) => { persistNodes(n); return n; }); },
    [onNodesChange, setNodes, persistNodes],
  );

  const handleEdgesChange: typeof onEdgesChange = useCallback(
    (changes) => { onEdgesChange(changes); setEdges((e) => { persistEdges(e); return e; }); },
    [onEdgesChange, setEdges, persistEdges],
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      setEdges((eds) => {
        const updated = addEdge({ ...connection, type: 'smoothstep', animated: true }, eds);
        persistEdges(updated);
        return updated;
      });
    },
    [setEdges, persistEdges],
  );

  const onDelete = useCallback(
    (id: string) => {
      setNodes((nds) => { const u = nds.filter((n) => n.id !== id); persistNodes(u); return u; });
      setEdges((eds) => { const u = eds.filter((e) => e.source !== id && e.target !== id); persistEdges(u); return u; });
    },
    [setNodes, setEdges, persistNodes, persistEdges],
  );

  const onUpdate = useCallback(
    (id: string, patch: Partial<WorkflowNodeData>) => {
      setNodes((nds) => {
        const u = nds.map((n) => n.id === id ? { ...n, data: { ...n.data, ...patch } } : n);
        persistNodes(u);
        return u;
      });
    },
    [setNodes, persistNodes],
  );

  const handleAddNode = useCallback(
    (nodeType: string) => {
      const def = NODE_TYPES[nodeType];
      if (!def) return;
      const id = `${nodeType}-${Date.now()}`;
      const newNode: Node = {
        id,
        type: 'workflow',
        position: { x: 250 + Math.random() * 300, y: 150 + Math.random() * 200 },
        data: {
          label: def.label,
          nodeType,
          config: { ...def.defaultConfig },
          onDelete,
          onUpdate,
        },
      };
      setNodes((nds) => { const u = [...nds, newNode]; persistNodes(u); return u; });
    },
    [setNodes, persistNodes, onDelete, onUpdate],
  );

  const handleClearAll = useCallback(() => {
    setNodes([]); setEdges([]);
    persistNodes([]); persistEdges([]);
  }, [setNodes, setEdges, persistNodes, persistEdges]);

  // Re-inject callbacks into loaded nodes (functions don't serialize)
  const nodesWithCbs = nodes.map((n) => ({
    ...n,
    data: { ...n.data, onDelete, onUpdate },
  }));

  return (
    <div className="wf-root">
      <Sidebar nodes={nodes} edges={edges} onAddNode={handleAddNode} onClearAll={handleClearAll} />
      <div className="wf-canvas-wrap">
        <ReactFlow
          nodes={nodesWithCbs}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          deleteKeyCode={['Backspace', 'Delete']}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#2a2e3b" />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(node) => {
              const nt = (node.data as { nodeType?: string })?.nodeType;
              return NODE_TYPES[nt || '']?.color || '#3b82f6';
            }}
            maskColor="rgba(15,17,23,0.8)"
          />
        </ReactFlow>

        {nodes.length === 0 && (
          <div className="wf-empty-state">
            <div className="wf-empty-icon">+</div>
            <p className="wf-empty-title">Start building your workflow</p>
            <p className="wf-empty-desc">Click a node type in the sidebar</p>
          </div>
        )}
      </div>
    </div>
  );
}
