import { useCallback, useRef } from 'react';
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

const nodeTypes: NodeTypes = { workflow: WorkflowNode };
const STORAGE_KEY = 'workflow-builder';

export default function App() {
  const [savedNodes, setSavedNodes] = useLocalStorage<Node[]>(`${STORAGE_KEY}-nodes`, []);
  const [savedEdges, setSavedEdges] = useLocalStorage<Edge[]>(`${STORAGE_KEY}-edges`, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(savedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(savedEdges);

  const persist = useCallback(() => {
    setNodes((n) => { setSavedNodes(n); return n; });
    setEdges((e) => { setSavedEdges(e); return e; });
  }, [setNodes, setEdges, setSavedNodes, setSavedEdges]);

  const handleNodesChange: typeof onNodesChange = useCallback(
    (changes) => { onNodesChange(changes); persist(); },
    [onNodesChange, persist],
  );

  const handleEdgesChange: typeof onEdgesChange = useCallback(
    (changes) => { onEdgesChange(changes); persist(); },
    [onEdgesChange, persist],
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      setEdges((eds) => {
        const updated = addEdge({ ...connection, type: 'smoothstep', animated: true }, eds);
        setSavedEdges(updated);
        return updated;
      });
    },
    [setEdges, setSavedEdges],
  );

  const onDelete = useCallback(
    (id: string) => {
      setNodes((nds) => { const u = nds.filter((n) => n.id !== id); setSavedNodes(u); return u; });
      setEdges((eds) => { const u = eds.filter((e) => e.source !== id && e.target !== id); setSavedEdges(u); return u; });
    },
    [setNodes, setEdges, setSavedNodes, setSavedEdges],
  );

  const onTextChange = useCallback(
    (id: string, text: string) => {
      setNodes((nds) => { const u = nds.map((n) => n.id === id ? { ...n, data: { ...n.data, text } } : n); setSavedNodes(u); return u; });
    },
    [setNodes, setSavedNodes],
  );

  const onLabelChange = useCallback(
    (id: string, label: string) => {
      setNodes((nds) => { const u = nds.map((n) => n.id === id ? { ...n, data: { ...n.data, label } } : n); setSavedNodes(u); return u; });
    },
    [setNodes, setSavedNodes],
  );

  const nodeCount = useRef(0);

  const handleAddNode = useCallback(() => {
    nodeCount.current += 1;
    const id = `node-${Date.now()}`;
    const canvasCenter = { x: 250 + Math.random() * 300, y: 150 + Math.random() * 200 };
    const newNode: Node = {
      id,
      type: 'workflow',
      position: canvasCenter,
      data: {
        label: `Node ${nodeCount.current}`,
        text: '',
        onDelete,
        onTextChange,
        onLabelChange,
      },
    };
    setNodes((nds) => { const u = [...nds, newNode]; setSavedNodes(u); return u; });
  }, [setNodes, setSavedNodes, onDelete, onTextChange, onLabelChange]);

  const handleClearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSavedNodes([]);
    setSavedEdges([]);
  }, [setNodes, setEdges, setSavedNodes, setSavedEdges]);

  const nodesWithCbs = nodes.map((n) => ({
    ...n,
    data: { ...n.data, onDelete, onTextChange, onLabelChange },
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
          <MiniMap nodeColor="#3b82f6" maskColor="rgba(15,17,23,0.8)" />
        </ReactFlow>

        {nodes.length === 0 && (
          <div className="wf-empty-state">
            <div className="wf-empty-icon">+</div>
            <p className="wf-empty-title">Start building your workflow</p>
            <p className="wf-empty-desc">Click Add Node in the sidebar</p>
          </div>
        )}
      </div>
    </div>
  );
}
