import {
  Token,
  ASTNode,
  ClassEnumASTNode,
  RelationshipASTNode,
  AttributeNode,
} from "./types";

export class ParsingError extends Error {
  constructor(message: string, public token: Token) {
    super(`Line ${token.lineNumber}: ${message}`);
    this.name = "ParsingError";
  }
}

export default function parse(tokens: Token[]): ASTNode[] {
  const ast: ASTNode[] = [];
  let currentNode: ClassEnumASTNode | null = null;

  function finishCurrentNode() {
    if (currentNode) {
      ast.push(currentNode);
      currentNode = null;
    }
  }

  function parseAttribute(
    tokens: Token[],
    index: number
  ): [AttributeNode, number] {
    const attribute: AttributeNode = { name: tokens[index].value, type: "" };
    let i = index + 1;
    while (i < tokens.length) {
      switch (tokens[i].type) {
        case "IDENTIFIER":
          attribute.type = tokens[i].value;
          break;
        case "MULTIPLICITY":
          attribute.multiplicity = tokens[i].value;
          break;
        case "DEFAULT_VALUE":
        case "ENUM_VALUE_ASSIGNMENT":
          attribute.defaultValue = tokens[i].value;
          break;
        default:
          return [attribute, i - 1];
      }
      i++;
    }
    return [attribute, i - 1];
  }

  function parseRelationship(
    tokens: Token[],
    index: number
  ): [RelationshipASTNode, number] {
    const relationship: RelationshipASTNode = {
      type: "relationship",
      relationshipType: tokens[index + 1].type as
        | "INHERITANCE"
        | "ASSOCIATION"
        | "AGGREGATION"
        | "COMPOSITION"
        | "DEPENDENCY"
        | "REALIZATION"
        | "SOLID_LINK"
        | "DASHED_LINK",
      name: `${tokens[index].value}_${tokens[index + 1].type}_${
        tokens[index + 2].value
      }`,
      source: tokens[index].value,
      target: tokens[index + 2].value,
    };
    let i = index + 3;
    if (i < tokens.length && tokens[i].type === "MULTIPLICITY") {
      relationship.sourceMultiplicity = tokens[i].value;
      i++;
      if (i < tokens.length && tokens[i].type === "MULTIPLICITY") {
        relationship.targetMultiplicity = tokens[i].value;
        i++;
      }
    }
    if (i < tokens.length && tokens[i].type === "ROLE") {
      relationship.role = tokens[i].value;
      i++;
    }
    return [relationship, i - 1];
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    switch (token.type) {
      case "CLASS":
      case "ENUM":
        finishCurrentNode();
        if (i + 1 >= tokens.length || tokens[i + 1].type !== "IDENTIFIER") {
          throw new ParsingError(
            `Expected identifier after ${token.value}`,
            token
          );
        }
        currentNode = {
          type: token.type === "CLASS" ? "class" : "enum",
          name: tokens[++i].value,
          attributes: [],
          constraints: [],
        };
        break;

      case "ATTRIBUTE": {
        if (
          !currentNode ||
          (currentNode.type !== "class" && currentNode.type !== "enum")
        ) {
          throw new ParsingError(
            "Attribute found outside of class or enum",
            token
          );
        }
        const [attribute, newAttrIndex] = parseAttribute(tokens, i);
        currentNode.attributes.push(attribute);
        i = newAttrIndex;
        break;
      }
      case "ENUM_VALUE":
        if (!currentNode || currentNode.type !== "enum") {
          throw new ParsingError("Enum value found outside of enum", token);
        }
        const [attribute, newAttrIndex] = parseAttribute(tokens, i);
        currentNode.attributes.push(attribute);
        i = newAttrIndex;
        break;

      case "IDENTIFIER":
        if (i + 1 < tokens.length && tokens[i + 1].type === "CONSTRAINT") {
          // ... (existing constraint handling)
        } else if (
          i + 1 < tokens.length &&
          (tokens[i + 1].type === "INHERITANCE" ||
            tokens[i + 1].type === "ASSOCIATION" ||
            tokens[i + 1].type === "AGGREGATION" ||
            tokens[i + 1].type === "COMPOSITION" ||
            tokens[i + 1].type === "DEPENDENCY" ||
            tokens[i + 1].type === "REALIZATION" ||
            tokens[i + 1].type === "SOLID_LINK" ||
            tokens[i + 1].type === "DASHED_LINK")
        ) {
          finishCurrentNode();
          const [relationship, newRelIndex] = parseRelationship(tokens, i);
          ast.push(relationship);
          i = newRelIndex;
        } else if (
          !currentNode ||
          (currentNode.type !== "class" && currentNode.type !== "enum")
        ) {
          throw new ParsingError(
            `Unexpected identifier: ${token.value}`,
            token
          );
        }
        break;

      case "CONSTRAINT":
        if (
          !currentNode ||
          (currentNode.type !== "class" && currentNode.type !== "enum")
        ) {
          throw new ParsingError(
            "Constraint found outside of class or enum",
            token
          );
        }
        if (i === 0 || tokens[i - 1].type !== "IDENTIFIER") {
          throw new ParsingError(
            "Constraint without associated attribute",
            token
          );
        }
        // The constraint has already been added in the IDENTIFIER case, so we can skip it here
        break;

      case "INHERITANCE":
      case "ASSOCIATION":
      case "AGGREGATION":
      case "COMPOSITION":
      case "DEPENDENCY":
      case "REALIZATION":
      case "SOLID_LINK":
      case "DASHED_LINK":
        // These should be handled in the IDENTIFIER case
        break;

      default:
        throw new ParsingError(`Unexpected token: ${token.type}`, token);
    }
  }

  finishCurrentNode();

  return ast;
}
