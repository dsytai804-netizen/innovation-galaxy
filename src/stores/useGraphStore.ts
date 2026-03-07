import { create } from 'zustand';

export interface GraphNode {
  id: string;
  label: string;
  type: 'technology' | 'scenario' | 'user' | 'core';
  position: [number, number, number];
  color: string;
  size: number;
  expanded: boolean;
  depth: number;
  children?: GraphNode[];
}

export interface GraphEdge {
  source: string;
  target: string;
}

interface GraphStore {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNode: GraphNode | null;
  hoveredNode: GraphNode | null;
  isExpanding: boolean;

  // Actions
  setNodes: (nodes: GraphNode[]) => void;
  addNodes: (nodes: GraphNode[]) => void;
  setEdges: (edges: GraphEdge[]) => void;
  addEdges: (edges: GraphEdge[]) => void;
  selectNode: (node: GraphNode | null) => void;
  hoverNode: (node: GraphNode | null) => void;
  expandNode: (nodeId: string, children: GraphNode[]) => void;
  setIsExpanding: (isExpanding: boolean) => void;
  loadInitialGraph: () => Promise<void>;
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  hoveredNode: null,
  isExpanding: false,

  setNodes: (nodes) => set({ nodes }),

  addNodes: (newNodes) => set((state) => ({
    nodes: [...state.nodes, ...newNodes],
  })),

  setEdges: (edges) => set({ edges }),

  addEdges: (newEdges) => set((state) => ({
    edges: [...state.edges, ...newEdges],
  })),

  selectNode: (node) => set({ selectedNode: node }),

  hoverNode: (node) => set({ hoveredNode: node }),

  expandNode: (nodeId, children) => {
    const state = get();
    const parentNode = state.nodes.find(n => n.id === nodeId);
    if (!parentNode) return;

    // Mark parent as expanded
    const updatedNodes = state.nodes.map(n =>
      n.id === nodeId ? { ...n, expanded: true, children } : n
    );

    // Add child nodes
    const newNodes = [...updatedNodes, ...children];

    // Create edges from parent to children
    const newEdges = children.map(child => ({
      source: nodeId,
      target: child.id,
    }));

    set({
      nodes: newNodes,
      edges: [...state.edges, ...newEdges],
      isExpanding: false,
    });
  },

  setIsExpanding: (isExpanding) => set({ isExpanding }),

  loadInitialGraph: async () => {
    try {
      const response = await fetch('/data/initial-graph.json');
      const data = await response.json();
      set({
        nodes: data.nodes || [],
        edges: data.edges || [],
      });
    } catch (error) {
      console.error('Failed to load initial graph:', error);
    }
  },
}));
