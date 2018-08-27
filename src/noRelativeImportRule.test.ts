import * as Path from "path";
import * as uuid from "uuid";
import { Test } from "./test";

test("produces no violations for empty file", () => {
  const result = Test.runRule({
    ruleName: "no-relative-import",
    file: { path: "test.ts", contents: "" }
  });

  expect(result.errorCount).toBe(0);
});

test("produces no violations for conforming import", () => {
  const ctx = Path.join(__dirname, "..", "fixtures", "relative-import");

  const result = Test.runRule({
    ruleName: "no-relative-import",
    file: {
      path: `${ctx}/a/lib/a.ts`,
      contents: 'import * as Thing from ./b.ts"'
    }
  });

  expect(result.errorCount).toBe(0);
});

test("produces violations for relative import crossing packages", () => {
  const ctx = Path.join(__dirname, "..", "fixtures", "relative-import");

  const result = Test.runRule({
    ruleName: "no-relative-import",
    file: {
      path: `${ctx}/a/index.ts`,
      contents: 'import * as Thing from "../b"'
    }
  });

  expect(result.errorCount).not.toBe(0);

  expect(result.failures).toContainEqual(
    expect.objectContaining({
      ruleName: "no-relative-import",
      failure: expect.stringContaining("relative-import/a")
    })
  );
});

test("produces no violations for named import crossing packages", () => {
  const ctx = Path.join(__dirname, "..", "fixtures", "relative-import");

  const result = Test.runRule({
    ruleName: "no-relative-import",
    file: {
      path: `${ctx}/a/a.ts`,
      contents: 'import * as Thing from "b"'
    }
  });

  expect(result.errorCount).toBe(0);
});

test("produces no violations for named import", () => {
  const ctx = Path.join(__dirname, "..", "fixtures", "relative-import");

  const result = Test.runRule({
    ruleName: "no-relative-import",
    file: {
      path: `${ctx}/a/a.ts`,
      contents: 'import * as ts from "typescript"'
    }
  });

  expect(result.errorCount).toBe(0);
});

test("produces no violations for unresolveable import", () => {
  const ctx = Path.join(__dirname, "..", "fixtures", "relative-import");

  const result = Test.runRule({
    ruleName: "no-relative-import",
    file: {
      path: `${ctx}/a/a.ts`,
      contents: `import * as Thing from "../../../${uuid.v4()}"`
    }
  });

  expect(result.errorCount).toBe(0);
});

test('works with "."', () => {
  const ctx = Path.join(__dirname, "..", "fixtures", "relative-import");

  const result = Test.runRule({
    ruleName: "no-relative-import",
    file: {
      path: `${ctx}/a/a.ts`,
      contents: `import * as Thing from "."`
    }
  });

  expect(result.errorCount).toBe(0);
});

test('works with multiple imports', () => {
  const ctx = Path.join(__dirname, "..", "fixtures", "relative-import");

  const result = Test.runRule({
    ruleName: "no-relative-import",
    file: {
      path: `${ctx}/a/a.ts`,
      contents: `
        import * as Thing from ".";
        import * as B from "../b";
      `
    }
  });

  expect(result.errorCount).toBe(1);

  expect(result.failures).toContainEqual(
    expect.objectContaining({
      ruleName: "no-relative-import",
      failure: expect.stringContaining("relative-import/a")
    })
  );
});
