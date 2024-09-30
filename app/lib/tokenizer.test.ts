import { describe, it, expect } from "vitest";
import tokenize, { TokenizationError } from "./tokenizer";

describe("UML Tokenizer", () => {
  it("should tokenize a simple class definition", () => {
    const input = `
      class Person {
        name: String
        age: Integer
      }
    `;
    const tokens = tokenize(input);
    expect(tokens).toEqual([
      { type: "CLASS", value: "class", lineNumber: 2 },
      { type: "IDENTIFIER", value: "Person", lineNumber: 2 },
      { type: "ATTRIBUTE", value: "name", lineNumber: 3 },
      { type: "IDENTIFIER", value: "String", lineNumber: 3 },
      { type: "ATTRIBUTE", value: "age", lineNumber: 4 },
      { type: "IDENTIFIER", value: "Integer", lineNumber: 4 },
    ]);
  });

  it("should tokenize an enum definition", () => {
    const input = `
      enum Color {
        RED
        GREEN
        BLUE
      }
    `;
    const tokens = tokenize(input);
    expect(tokens).toEqual([
      { type: "ENUM", value: "enum", lineNumber: 2 },
      { type: "IDENTIFIER", value: "Color", lineNumber: 2 },
      { type: "ENUM_VALUE", value: "RED", lineNumber: 3 },
      { type: "ENUM_VALUE", value: "GREEN", lineNumber: 4 },
      { type: "ENUM_VALUE", value: "BLUE", lineNumber: 5 },
    ]);
  });

  it("should tokenize attributes with multiplicity and default values", () => {
    const input = `
      class User {
        id: Integer
        name: String [0..1]
        email: String = "user@example.com"
        roles: String [0..*] = []
      }
    `;
    const tokens = tokenize(input);
    expect(tokens).toEqual([
      { type: "CLASS", value: "class", lineNumber: 2 },
      { type: "IDENTIFIER", value: "User", lineNumber: 2 },
      { type: "ATTRIBUTE", value: "id", lineNumber: 3 },
      { type: "IDENTIFIER", value: "Integer", lineNumber: 3 },
      { type: "ATTRIBUTE", value: "name", lineNumber: 4 },
      { type: "IDENTIFIER", value: "String", lineNumber: 4 },
      { type: "MULTIPLICITY", value: "[0..1]", lineNumber: 4 },
      { type: "ATTRIBUTE", value: "email", lineNumber: 5 },
      { type: "IDENTIFIER", value: "String", lineNumber: 5 },
      { type: "DEFAULT_VALUE", value: '"user@example.com"', lineNumber: 5 },
      { type: "ATTRIBUTE", value: "roles", lineNumber: 6 },
      { type: "IDENTIFIER", value: "String", lineNumber: 6 },
      { type: "MULTIPLICITY", value: "[0..*]", lineNumber: 6 },
      { type: "DEFAULT_VALUE", value: "[]", lineNumber: 6 },
    ]);
  });

  it("should tokenize relationships", () => {
    const input = `
      Class1 <|-- Class2
      Class3 --o Class4
      Class5 --* Class6
      Interface1 ..|> Class7
      Class8 -- Class9
      Class10 ..> Class11
    `;
    const tokens = tokenize(input);
    expect(tokens).toEqual([
      { type: "IDENTIFIER", value: "Class1", lineNumber: 2 },
      { type: "INHERITANCE", value: "<|--", lineNumber: 2 },
      { type: "IDENTIFIER", value: "Class2", lineNumber: 2 },
      { type: "IDENTIFIER", value: "Class3", lineNumber: 3 },
      { type: "AGGREGATION", value: "--o", lineNumber: 3 },
      { type: "IDENTIFIER", value: "Class4", lineNumber: 3 },
      { type: "IDENTIFIER", value: "Class5", lineNumber: 4 },
      { type: "COMPOSITION", value: "--*", lineNumber: 4 },
      { type: "IDENTIFIER", value: "Class6", lineNumber: 4 },
      { type: "IDENTIFIER", value: "Interface1", lineNumber: 5 },
      { type: "REALIZATION", value: "..|>", lineNumber: 5 },
      { type: "IDENTIFIER", value: "Class7", lineNumber: 5 },
      { type: "IDENTIFIER", value: "Class8", lineNumber: 6 },
      { type: "ASSOCIATION", value: "--", lineNumber: 6 },
      { type: "IDENTIFIER", value: "Class9", lineNumber: 6 },
      { type: "IDENTIFIER", value: "Class10", lineNumber: 7 },
      { type: "DEPENDENCY", value: "..>", lineNumber: 7 },
      { type: "IDENTIFIER", value: "Class11", lineNumber: 7 },
    ]);
  });

  it("should tokenize relationships with multiplicities and roles", () => {
    const input = `
      Class1 "1" -- "0..*" Class2 : contains
      Class3 "1..*" --o "1" Class4 : partOf
    `;
    const tokens = tokenize(input);
    expect(tokens).toEqual([
      { type: "IDENTIFIER", value: "Class1", lineNumber: 2 },
      { type: "MULTIPLICITY", value: "1", lineNumber: 2 },
      { type: "ASSOCIATION", value: "--", lineNumber: 2 },
      { type: "MULTIPLICITY", value: "0..*", lineNumber: 2 },
      { type: "IDENTIFIER", value: "Class2", lineNumber: 2 },
      { type: "ROLE", value: "contains", lineNumber: 2 },
      { type: "IDENTIFIER", value: "Class3", lineNumber: 3 },
      { type: "MULTIPLICITY", value: "1..*", lineNumber: 3 },
      { type: "AGGREGATION", value: "--o", lineNumber: 3 },
      { type: "MULTIPLICITY", value: "1", lineNumber: 3 },
      { type: "IDENTIFIER", value: "Class4", lineNumber: 3 },
      { type: "ROLE", value: "partOf", lineNumber: 3 },
    ]);
  });

  it("should tokenize constraints", () => {
    const input = `
      class User {
        username: String
        username.size() <= 20
        password: String
        password.matches("^[a-zA-Z0-9]{8,}$")
      }
    `;
    const tokens = tokenize(input);
    expect(tokens).toEqual([
      { type: "CLASS", value: "class", lineNumber: 2 },
      { type: "IDENTIFIER", value: "User", lineNumber: 2 },
      { type: "ATTRIBUTE", value: "username", lineNumber: 3 },
      { type: "IDENTIFIER", value: "String", lineNumber: 3 },
      { type: "IDENTIFIER", value: "username", lineNumber: 4 },
      { type: "CONSTRAINT", value: "size() <= 20", lineNumber: 4 },
      { type: "ATTRIBUTE", value: "password", lineNumber: 5 },
      { type: "IDENTIFIER", value: "String", lineNumber: 5 },
      { type: "IDENTIFIER", value: "password", lineNumber: 6 },
      {
        type: "CONSTRAINT",
        value: 'matches("^[a-zA-Z0-9]{8,}$")',
        lineNumber: 6,
      },
    ]);
  });

  it("should tokenize a complex UML diagram", () => {
    const input = `
      enum UserType {
        ADMIN
        REGULAR
        GUEST
      }

      class User {
        id: Integer {id}
        username: String
        email: String [0..1]
        type: UserType
        createdAt: Date = now()
        username.size() <= 50
      }

      class Post {
        id: Integer {id}
        title: String
        content: String [0..1]
        published: Boolean = false
      }

      class Comment {
        id: Integer {id}
        content: String
        createdAt: Date = now()
      }

      User "1" -- "0..*" Post : creates
      Post "1" --o "0..*" Comment : has
      User "1" -- "0..*" Comment : writes
      User <|-- Admin
      User ..> AuthService : uses
    `;
    const tokens = tokenize(input);
    // We'll check for the presence of specific tokens rather than the exact sequence
    expect(tokens).toContainEqual({
      type: "ENUM",
      value: "enum",
      lineNumber: 2,
    });
    expect(tokens).toContainEqual({
      type: "CLASS",
      value: "class",
      lineNumber: 8,
    });
    expect(tokens).toContainEqual({
      type: "ATTRIBUTE",
      value: "id",
      lineNumber: 9,
    });
    expect(tokens).toContainEqual({
      type: "MULTIPLICITY",
      value: "[0..1]",
      lineNumber: 11,
    });
    expect(tokens).toContainEqual({
      type: "DEFAULT_VALUE",
      value: "now()",
      lineNumber: 13,
    });
    expect(tokens).toContainEqual({
      type: "IDENTIFIER",
      value: "username",
      lineNumber: 14,
    });
    expect(tokens).toContainEqual({
      type: "CONSTRAINT",
      value: "size() <= 50",
      lineNumber: 14,
    });
    expect(tokens).toContainEqual({
      type: "ASSOCIATION",
      value: "--",
      lineNumber: 29,
    });
    expect(tokens).toContainEqual({
      type: "AGGREGATION",
      value: "--o",
      lineNumber: 30,
    });
    expect(tokens).toContainEqual({
      type: "INHERITANCE",
      value: "<|--",
      lineNumber: 32,
    });
    expect(tokens).toContainEqual({
      type: "DEPENDENCY",
      value: "..>",
      lineNumber: 33,
    });
  });

  it("should throw a TokenizationError for invalid syntax", () => {
    const input = `
      class InvalidClass {
        invalidAttribute: @InvalidType
      }
    `;
    expect(() => tokenize(input)).toThrow(TokenizationError);
  });
});
