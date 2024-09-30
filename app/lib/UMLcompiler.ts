// Main function
import { generate } from "./generator";
import tokenize, { TokenizationError } from "./tokenizer";
import { ParsingError } from "./ast";
import parse from "./parser";
import { ParsedResult } from "./types";

/**
 * Parses UML text and converts it to a format suitable for ReactFlow.
 * @param text The UML text to parse.
 * @returns A ParsedResult containing nodes and edges for ReactFlow.
 */
export default function compile(text: string): ParsedResult {
  try {
    const tokens = tokenize(text);
    const ast = parse(tokens);
    return generate(ast);
  } catch (error) {
    if (error instanceof TokenizationError || error instanceof ParsingError) {
      console.error(error.message);
      // You might want to handle these errors differently, e.g., displaying them to the user
      return { nodes: [], edges: [] };
    }

    throw error; // Re-throw unexpected errors
  }
}
