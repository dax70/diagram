import { Token, TokenType } from "./tokenizer";

// Parser
type ASTNodeType = "class" | "enum" | "relationship";

type BaseASTNode = {
  type: ASTNodeType;
  name: string;
};

export type ClassEnumASTNode = BaseASTNode & {
  type: "class" | "enum";
  attributes: string[];
};

export type RelationshipASTNode = BaseASTNode & {
  type: "relationship";
  relationshipType: TokenType;
  source: string;
  target: string;
};

export type ASTNode = ClassEnumASTNode | RelationshipASTNode;

export class ParsingError extends Error {
  constructor(message: string, public token: Token) {
    super(`Line ${token.lineNumber}: ${message}`);
    this.name = "ParsingError";
  }
}
