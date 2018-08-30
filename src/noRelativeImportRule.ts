import * as Lint from "tslint";
import { findImports, ImportKind } from "tsutils";
import * as ts from "typescript";
import * as Fs from "fs";
import * as Path from "path";
import * as resolveFrom from "resolve-from";

export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk, this.ruleArguments);
  }
}

function walk(ctx: Lint.WalkContext<string[]>) {
  const fileBase = Path.resolve(Path.dirname(ctx.sourceFile.fileName));
  const base = findPackageBase(fileBase);

  for (const name of findImports(ctx.sourceFile, ImportKind.All)) {
    const target = (resolveFrom as any).silent(fileBase, name.text);

    if (target === null) {
      continue;
    }

    const isAbsolute = !name.text.startsWith('.') && !name.text.startsWith('/');

    if (isAbsolute) {
      continue;
    }

    if (isSubDirectory(target, base)) {
      continue;
    }

    ctx.addFailure(
      name.getStart(ctx.sourceFile) + 1,
      name.end - 1,
      `Imports reaching out of of package root "${base}" are forbidden`
    );
  }
}

function findPackageBase(current: string): string {
  let prev: string;
  do {
    const fileName = Path.join(current, "package.json");
    if (Fs.existsSync(fileName)) {
      return Path.dirname(fileName);
    }
    prev = current;
    current = Path.dirname(current);
  } while (prev !== current);

  return Path.dirname(current);
}

export function isSubDirectory(candidate: string, parent: string): boolean {
  if (candidate === parent) {
    return false;
  }

  const fragments = candidate.split(Path.sep);
  return parent.split(Path.sep).every((t, i) => fragments[i] === t)
}
