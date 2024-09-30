import { Token, TokenType } from "./types";

export class TokenizationError extends Error {
  constructor(message: string, public lineNumber: number, public line: string) {
    super(`Line ${lineNumber}: ${message}\nProblematic line: "${line}"`);
    this.name = "TokenizationError";
  }
}

export default function tokenize(input: string): Token[] {
  const lines = input.split("\n");
  const tokens: Token[] = [];
  let inEnum = false;
  let inClass = false;

  lines.forEach((line, lineNumber) => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("--")) return; // Skip empty lines and comments

    try {
      if (trimmedLine === "}") {
        inEnum = false;
        inClass = false;
        return;
      }

      if (trimmedLine.startsWith("enum")) {
        tokens.push({
          type: "ENUM",
          value: "enum",
          lineNumber: lineNumber + 1,
        });
        const enumName = trimmedLine.split(" ")[1];
        tokens.push({
          type: "IDENTIFIER",
          value: enumName,
          lineNumber: lineNumber + 1,
        });
        inEnum = true;
      } else if (inEnum) {
        const parts = trimmedLine.split(":");
        tokens.push({
          type: "ENUM_VALUE",
          value: parts[0].trim(),
          lineNumber: lineNumber + 1,
        });
        if (parts.length > 1) {
          tokens.push({
            type: "ENUM_VALUE_ASSIGNMENT",
            value: parts[1].trim(),
            lineNumber: lineNumber + 1,
          });
        }
      } else if (trimmedLine.startsWith("class")) {
        tokens.push({
          type: "CLASS",
          value: "class",
          lineNumber: lineNumber + 1,
        });
        const className = trimmedLine.split(" ")[1];
        tokens.push({
          type: "IDENTIFIER",
          value: className,
          lineNumber: lineNumber + 1,
        });
        inClass = true;
      } else if (inClass) {
        if (
          trimmedLine.includes(".") &&
          (trimmedLine.includes("(") ||
            trimmedLine.includes("<") ||
            trimmedLine.includes(">"))
        ) {
          // This is a constraint
          const [attribute, ...constraintParts] = trimmedLine.split(".");
          tokens.push({
            type: "IDENTIFIER",
            value: attribute.trim(),
            lineNumber: lineNumber + 1,
          });
          tokens.push({
            type: "CONSTRAINT",
            value: constraintParts.join(".").trim(),
            lineNumber: lineNumber + 1,
          });
        } else if (trimmedLine.includes(":")) {
          // This is an attribute
          const [name, rest] = trimmedLine.split(":");
          tokens.push({
            type: "ATTRIBUTE",
            value: name.trim(),
            lineNumber: lineNumber + 1,
          });

          const parts = rest.trim().split(/\s+/);
          tokens.push({
            type: "IDENTIFIER",
            value: parts[0],
            lineNumber: lineNumber + 1,
          });

          if (parts.includes("[0..1]")) {
            tokens.push({
              type: "MULTIPLICITY",
              value: "[0..1]",
              lineNumber: lineNumber + 1,
            });
          }

          const defaultValueIndex = parts.indexOf("=");
          if (
            defaultValueIndex !== -1 &&
            defaultValueIndex < parts.length - 1
          ) {
            tokens.push({
              type: "DEFAULT_VALUE",
              value: parts
                .slice(defaultValueIndex + 1)
                .join(" ")
                .replace(/^"|"$/g, ""),
              lineNumber: lineNumber + 1,
            });
          }
        }
      } else {
        // Handle relationships
        const relationshipPatterns = [
          { pattern: "<|--", type: "INHERITANCE" },
          { pattern: "--", type: "ASSOCIATION" },
          { pattern: "--o", type: "AGGREGATION" },
          { pattern: "--*", type: "COMPOSITION" },
          { pattern: "..>", type: "DEPENDENCY" },
          { pattern: "..|>", type: "REALIZATION" },
          { pattern: "--", type: "SOLID_LINK" },
          { pattern: "..", type: "DASHED_LINK" },
        ];

        let relationshipFound = false;
        for (const { pattern, type } of relationshipPatterns) {
          if (trimmedLine.includes(pattern)) {
            const parts = trimmedLine.split(/\s+/);
            tokens.push({
              type: "IDENTIFIER",
              value: parts[0],
              lineNumber: lineNumber + 1,
            });
            tokens.push({
              type: type as TokenType,
              value: pattern,
              lineNumber: lineNumber + 1,
            });
            tokens.push({
              type: "IDENTIFIER",
              value: parts[parts.length - 1],
              lineNumber: lineNumber + 1,
            });

            if (parts.length > 3) {
              if (parts[1].startsWith('"') && parts[1].endsWith('"')) {
                tokens.push({
                  type: "MULTIPLICITY",
                  value: parts[1].slice(1, -1),
                  lineNumber: lineNumber + 1,
                });
              }
              if (
                parts[parts.length - 2].startsWith('"') &&
                parts[parts.length - 2].endsWith('"')
              ) {
                tokens.push({
                  type: "MULTIPLICITY",
                  value: parts[parts.length - 2].slice(1, -1),
                  lineNumber: lineNumber + 1,
                });
              }
            }

            if (parts[parts.length - 1].includes(":")) {
              const [, role] = parts[parts.length - 1].split(":");
              tokens.push({
                type: "ROLE",
                value: role.trim(),
                lineNumber: lineNumber + 1,
              });
            }

            relationshipFound = true;
            break;
          }
        }

        if (!relationshipFound) {
          throw new TokenizationError(
            "Unrecognized syntax",
            lineNumber + 1,
            trimmedLine
          );
        }
      }
    } catch (error) {
      if (error instanceof TokenizationError) {
        throw error;
      } else {
        throw new TokenizationError(
          `Unexpected error: ${(error as Error).message}`,
          lineNumber + 1,
          trimmedLine
        );
      }
    }
  });

  return tokens;
}
