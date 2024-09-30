import { Edge, Node, ReactFlow, ReactFlowProps } from "@xyflow/react";

export default function Diagram<NodeType extends Node, EdgeType extends Edge>({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  nodeTypes,
  onConnect,
}: ReactFlowProps<NodeType, EdgeType>) {
  return (
    <div className="w-full h-full bg-white border border-gray-300 rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onConnect={onConnect}
        fitView
      />
    </div>
  );
}
