import { Edge, Node } from "@xyflow/react";

// Tokenizer types
export type TokenType =
  | "CLASS"
  | "ENUM"
  | "ATTRIBUTE"
  | "ENUM_VALUE"
  | "INHERITANCE"
  | "ASSOCIATION"
  | "AGGREGATION"
  | "COMPOSITION"
  | "DEPENDENCY"
  | "REALIZATION"
  | "SOLID_LINK"
  | "DASHED_LINK"
  | "IDENTIFIER"
  | "MULTIPLICITY"
  | "DEFAULT_VALUE"
  | "CONSTRAINT"
  | "ROLE";

export type Token = {
  type: TokenType;
  value: string;
  lineNumber: number;
};

// Parser types
export type ASTNodeType = "class" | "enum" | "relationship";

export type AttributeNode = {
  name: string;
  type: string;
  multiplicity?: string;
  defaultValue?: string;
};

export type ConstraintNode = {
  attribute: string;
  constraint: string;
};

export type ClassEnumASTNode = {
  type: "class" | "enum";
  name: string;
  attributes: AttributeNode[];
  constraints: ConstraintNode[];
};

export type RelationshipASTNode = {
  type: "relationship";
  relationshipType:
    | "INHERITANCE"
    | "ASSOCIATION"
    | "AGGREGATION"
    | "COMPOSITION"
    | "DEPENDENCY"
    | "REALIZATION"
    | "SOLID_LINK"
    | "DASHED_LINK";
  name: string;
  source: string;
  target: string;
  sourceMultiplicity?: string;
  targetMultiplicity?: string;
  role?: string;
};

export type ASTNode = ClassEnumASTNode | RelationshipASTNode;

// Generator types
export type NodeData = {
  label: string;
  attributes: string[];
  constraints: string[];
  isEnum: boolean;
};

export type ParsedResult = {
  nodes: Node<NodeData>[];
  edges: Edge[];
};
