import { useCallback, useState } from 'react';
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
  type Connection,
  BackgroundVariant,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import Sidebar from './components/Sidebar';
import WorkflowNode from './components/WorkflowNode';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  NODE_TYPES,
  type WorkflowNodeData,
} from './nodeTypes';

const nodeTypes: NodeTypes = {
  workflow: WorkflowNode,
};

const STORAGE_KEY = 'workflow-builder';

export default function App() {
  const [savedNodes, setSavedNodes] =
    useLocalStorage<Node[]>(
      `${STORAGE_KEY}-nodes`,
      [],
    );

  const [savedEdges, setSavedEdges] =
    useLocalStorage<Edge[]>(
      `${STORAGE_KEY}-edges`,
      [],
    );

  const [nodes, setNodes, onNodesChange] =
    useNodesState(savedNodes);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState(savedEdges);

  const [createMenu, setCreateMenu] =
    useState<{
      x: number;
      y: number;
      sourceNodeId: string;
    } | null>(null);

  const persistNodes = useCallback(
    (ns: Node[]) => setSavedNodes(ns),
    [setSavedNodes],
  );

  const persistEdges = useCallback(
    (es: Edge[]) => setSavedEdges(es),
    [setSavedEdges],
  );

  const handleNodesChange: typeof onNodesChange =
    useCallback(
      (changes) => {
        onNodesChange(changes);
        setNodes((n) => {
          persistNodes(n);
          return n;
        });
      },
      [onNodesChange, setNodes, persistNodes],
    );

  const handleEdgesChange: typeof onEdgesChange =
    useCallback(
      (changes) => {
        onEdgesChange(changes);
        setEdges((e) => {
          persistEdges(e);
          return e;
        });
      },
      [onEdgesChange, setEdges, persistEdges],
    );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      setEdges((eds) => {
        const updated = addEdge(
          {
            ...connection,
            type: 'smoothstep',
            animated: true,
          },
          eds,
        );

        persistEdges(updated);
        return updated;
      });
    },
    [setEdges, persistEdges],
  );

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, connection: Connection) => {
      if (!connection.source) {
        return;
      }

      const mouseEvent = event as MouseEvent;

      setCreateMenu({
        x: mouseEvent.clientX,
        y: mouseEvent.clientY,
        sourceNodeId: connection.source,
      });
    },
    [],
  );

  const onDelete = useCallback(
    (id: string) => {
      setNodes((nds) => {
        const updated = nds.filter(
          (n) => n.id !== id,
        );

        persistNodes(updated);

        return updated;
      });

      setEdges((eds) => {
        const updated = eds.filter(
          (e) =>
            e.source !== id &&
            e.target !== id,
        );

        persistEdges(updated);

        return updated;
      });
    },
    [setNodes, setEdges],
  );

  const onUpdate = useCallback(
    (
      id: string,
      patch: Partial<WorkflowNodeData>,
    ) => {
      setNodes((nds) => {
        const updated = nds.map((n) =>
          n.id === id
            ? {
                ...n,
                data: {
                  ...n.data,
                  ...patch,
                },
              }
            : n,
        );

        persistNodes(updated);

        return updated;
      });
    },
    [setNodes, persistNodes],
  );

  /*
  const handleAddNode = useCallback(
    (nodeType: string) => {
      const def = NODE_TYPES[nodeType];

      const id = `${nodeType}-${Date.now()}`;

      const node: Node = {
        id,
        type: 'workflow',
        position: {
          x: 250 + Math.random() * 200,
          y: 150 + Math.random() * 200,
        },
        data: {
          label: def.label,
          nodeType,
          config: {
            ...def.defaultConfig,
          },
          onDelete,
          onUpdate,
        },
      };

      setNodes((nds) => {
        const updated = [...nds, node];

        persistNodes(updated);

        return updated;
      });
    },
    [setNodes, persistNodes, onDelete, onUpdate],
  );
  */

  const handleAddNode = useCallback(
    (
      nodeType: string,
      position?: { x: number; y: number },
      sourceNodeId?: string,
    ) => {
      const def = NODE_TYPES[nodeType];

      const id = `${nodeType}-${Date.now()}`;

      const node: Node = {
        id,
        type: 'workflow',
        position: position ?? {
          x: 250 + Math.random() * 200,
          y: 150 + Math.random() * 200,
        },
        data: {
          label: def.label,
          nodeType,
          config: {
            ...def.defaultConfig,
          },
          onDelete,
          onUpdate,
        },
      };  

      setNodes((nds) => {
        const updated = [...nds, node];

        persistNodes(updated);

        return updated;
      });

      if (sourceNodeId) {
        setEdges((eds) => {
          const updated = addEdge(
            {
              source: sourceNodeId,
              target: id,
              type: 'smoothstep',
              animated: true,
            },
            eds,
          );

          persistEdges(updated);

          return updated;
        });
      }
    },
    [
      setNodes,
      setEdges,
      persistNodes,
      persistEdges,
      onDelete,
      onUpdate,
    ],
  );

  const handleClearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);

    persistNodes([]);
    persistEdges([]);
  }, []);

  const runWorkflow = useCallback(() => {
    setNodes((nds) => {
      const updated = nds.map((node) => {
        const incomingEdge = edges.find(
          (e) => e.target === node.id
        );

        if (!incomingEdge) {
          return node;
        }

        const sourceNode = nds.find(
          (n) => n.id === incomingEdge.source
        );

        if (!sourceNode) {
          return node;
        }

        const sourceData =
          sourceNode.data as WorkflowNodeData;

        const targetData =
          node.data as WorkflowNodeData;

        if (
          sourceData.nodeType === 'prompt' &&
          targetData.nodeType === 'output'
        ) {
          const text =
            (sourceData.config as any).text ?? '';

          return {
            ...node,
            data: {
              ...node.data,
              config: {
                output: text,
              },
            },
          };
        }

        return node;
      });

      persistNodes(updated);

      return updated;
    });
  }, [edges, setNodes, persistNodes]);

  const nodesWithCallbacks = nodes.map(
    (node) => ({
      ...node,
      data: {
        ...node.data,
        onDelete,
        onUpdate,
      },
    }),
  );

  return (
    <div className="wf-root">
      <Sidebar
        nodes={nodes}
        edges={edges}
        onAddNode={handleAddNode}
        onClearAll={handleClearAll}
      />

      <div className="wf-canvas-wrap">
        <button
          onClick={runWorkflow}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1000,
            padding: '10px 18px',
            borderRadius: '8px',
            border: '1px solid #3f3f46',
            background: '#18181b',
            color: '#fafafa',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow:
              '0 4px 12px rgba(0,0,0,0.25)',
          }}
        >
          ▶ Run Workflow
        </button>

        <ReactFlow
          nodes={nodesWithCallbacks}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onConnectEnd={onConnectEnd}
          nodeTypes={nodeTypes}
          fitView
        >
          
          {createMenu && (
            <div
              style={{
                position: 'fixed',
                left: createMenu.x,
                top: createMenu.y,
                zIndex: 9999,
                background: '#18181b',
                border: '1px solid #27272a',
                borderRadius: 12,
                padding: 8,
                minWidth: 180,
                boxShadow: '0 10px 25px rgba(0,0,0,0.35)',
              }}
            >
            {Object.values(NODE_TYPES).map(
              ({ nodeType, label, icon: Icon, color }) => (
                <button
                  key={nodeType}
                    onClick={() => {
                    handleAddNode(
                      nodeType,
                      {
                        x: createMenu.x,
                        y: createMenu.y,
                      },
                      createMenu.sourceNodeId,
                    );

                    setCreateMenu(null);
                  }}
                  style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: 10,
                  borderRadius: 8,
                  border: 'none',
                  background: 'transparent',
                  color: '#fff',
                  cursor: 'pointer',
                }}
                >
                <Icon size={16} style={{ color }} />
                  {label}
                  </button>
              ),
            )}
            </div>
          )}
          
          <Background
            variant={BackgroundVariant.Dots}
          />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}