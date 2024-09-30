import { Edge, MarkerType, Node } from "@xyflow/react";
import {
  ASTNode,
  ClassEnumASTNode,
  RelationshipASTNode,
  AttributeNode,
  ConstraintNode,
  NodeData,
  ParsedResult,
} from "./types";

function formatAttribute(attr: AttributeNode): string | null {
  if (attr.type === "enum_value" && !attr.defaultValue) {
    return attr.name; // Only return the name for enum values without a default value
  }

  let result = `${attr.name}`;
  if (attr.type && attr.type !== "enum_value") {
    result += `: ${attr.type}`;
  }
  if (attr.multiplicity) {
    result += ` ${attr.multiplicity}`;
  }
  if (attr.defaultValue) {
    result += `: ${attr.defaultValue}`;
  }
  return result;
}

function formatConstraint(constraint: ConstraintNode): string {
  return `${constraint.attribute}.${constraint.constraint}`;
}

export function generate(ast: ASTNode[]): ParsedResult {
  const nodes: Node<NodeData>[] = [];
  const edges: Edge[] = [];
  const nodeMap = new Map<string, string>();

  ast.forEach((node, index) => {
    if (node.type === "class" || node.type === "enum") {
      const classEnumNode = node as ClassEnumASTNode;
      const id = (index + 1).toString();
      nodes.push({
        id,
        type: "entity",
        position: { x: 100 * (index + 1), y: 100 * (index + 1) },
        data: {
          label: classEnumNode.name,
          isEnum: classEnumNode.type === "enum",
          attributes: classEnumNode.attributes
            .map(formatAttribute)
            .filter((attr): attr is string => attr !== null),
          constraints: classEnumNode.constraints.map(formatConstraint),
        },
      });
      nodeMap.set(classEnumNode.name, id);
    }
  });

  // Create edges for relationships
  ast.forEach((node) => {
    if (node.type === "relationship") {
      const relationshipNode = node as RelationshipASTNode;
      const sourceId = nodeMap.get(relationshipNode.source);
      const targetId = nodeMap.get(relationshipNode.target);
      if (sourceId && targetId) {
        const edgeStyle = {
          stroke: "#000",
          strokeWidth: 1,
        };
        let markerEnd = {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: "#000",
        };

        switch (relationshipNode.relationshipType) {
          case "INHERITANCE":
            markerEnd = { ...markerEnd, type: MarkerType.ArrowClosed };
            break;
          case "ASSOCIATION":
            markerEnd = { ...markerEnd, type: MarkerType.Arrow };
            break;
          case "AGGREGATION":
            markerEnd = { ...markerEnd, type: MarkerType.Diamond };
            break;
          case "COMPOSITION":
            markerEnd = {
              ...markerEnd,
              type: MarkerType.Diamond,
              color: "#000",
            };
            break;
          case "DEPENDENCY":
            edgeStyle.strokeDasharray = "5,5";
            markerEnd = { ...markerEnd, type: MarkerType.Arrow };
            break;
          case "REALIZATION":
            edgeStyle.strokeDasharray = "5,5";
            markerEnd = { ...markerEnd, type: MarkerType.ArrowClosed };
            break;
          case "SOLID_LINK":
            markerEnd = { ...markerEnd, type: MarkerType.None };
            break;
          case "DASHED_LINK":
            edgeStyle.strokeDasharray = "5,5";
            markerEnd = { ...markerEnd, type: MarkerType.None };
            break;
        }

        edges.push({
          id: `e${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          type: "smoothstep",
          style: edgeStyle,
          markerEnd: markerEnd,
          label: relationshipNode.role || "",
          labelStyle: { fill: "#000", fontWeight: 700 },
          labelBgStyle: { fill: "#fff" },
        });
      }
    }
  });

  return { nodes, edges };
}

export function generateEdges() {
  const edges = [
    {
      id: "e1-2",
      source: "1",
      target: "2",
      markerEnd: {
        type: MarkerType.Arrow,
      },
      label: "default arrow",
    },
    {
      id: "e2-3",
      source: "2",
      target: "3",
      markerEnd: {
        type: MarkerType.Custom,
        id: "circle",
      },
      label: "custom circle",
    },
    {
      id: "e3-4",
      source: "3",
      target: "4",
      markerEnd: {
        type: MarkerType.Custom,
        id: "logo",
      },
      label: "custom logo",
    },
  ];

  return edges;
}
