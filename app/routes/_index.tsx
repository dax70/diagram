import { useCallback, useState, useEffect } from "react";
import type { LinksFunction, MetaFunction } from "@remix-run/cloudflare";
import {
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  OnConnect,
  Edge,
  Node,
} from "@xyflow/react";
import reactflowStyles from "@xyflow/react/dist/style.css?url";
import compile from "../lib/UMLcompiler";
import { Direction, getLayoutedElements } from "../lib/layout";
import Diagram from "~/components/diagram";
import EditTextbox from "~/components/edit-textbox";
import TwoColumnLayout from "~/components/two-column";
import EntityNode from "~/components/entity-node";

export const meta: MetaFunction = () => {
  return [
    { title: "Diagram App" },
    { name: "description", content: "UML to Beautiful Diagram." },
  ];
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: reactflowStyles }];
};

const nodeTypes = {
  entity: EntityNode,
};

export default function Index() {
  const [umlText, setUmlText] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const onConnect: OnConnect = useCallback(
    (connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: ConnectionLineType.SmoothStep,
            animated: true,
          },
          eds
        )
      ),
    [setEdges]
  );

  const onLayout = useCallback(
    (direction: Direction) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(nodes, edges, direction);

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges, setNodes, setEdges]
  );

  useEffect(() => {
    const { nodes: parsedNodes, edges: parsedEdges } = compile(umlText);
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      parsedNodes,
      parsedEdges
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [umlText, setNodes, setEdges]);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-center space-x-4 my-2">
        <button
          className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700"
          onClick={() => onLayout("TB")}
        >
          Vertical Layout
        </button>
        <button
          className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700"
          onClick={() => onLayout("LR")}
        >
          Horizontal Layout
        </button>
      </div>
      <TwoColumnLayout
        rightContent={<EditTextbox input={umlText} onChange={setUmlText} />}
      >
        <Diagram
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onConnect={onConnect}
          fitView
        />
      </TwoColumnLayout>
    </div>
  );
}
