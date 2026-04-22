// ═══════════════════════════════════════════════════════════════
// ESLint Rule: no-import-in-import
// Prevents import declarations that appear to be injected inside
// another multi-line import's specifier list.
//
// This works at the AST level — the parser itself will reject truly
// broken syntax, so this rule catches the *result* of bad auto-fixes:
// two adjacent import declarations where the first is missing symbols
// that appear in a comment or were lost.
//
// Primary check: consecutive ImportDeclaration nodes on the same line
// or where the previous import's closing brace is missing (range gap).
// ═══════════════════════════════════════════════════════════════

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    fixable: "code",
    docs: {
      description: "Disallow import declarations that appear spliced into another import block",
    },
    messages: {
      splicedImport:
        "This import may have been injected inside another multi-line import. Verify surrounding imports are well-formed.",
    },
    schema: [],
  },
  create(context) {
    return {
      Program(node) {
        const imports = node.body.filter((n) => n.type === "ImportDeclaration");
        const sourceCode = context.sourceCode ?? context.getSourceCode();
        const text = sourceCode.getText();

        for (let i = 1; i < imports.length; i++) {
          const prev = imports[i - 1];
          const curr = imports[i];

          // Check the text between the two imports for orphaned specifiers
          // (commas, bare identifiers not in a comment)
          const gap = text.slice(prev.range[1], curr.range[0]);
          const cleaned = gap
            .replace(/\/\/.*$/gm, "")
            .replace(/\/\*[\s\S]*?\*\//g, "")
            .replace(/[\s,;]+/g, "");

          if (cleaned.length > 0 && /^[A-Za-z_$]/.test(cleaned)) {
            context.report({
              node: curr,
              messageId: "splicedImport",
              fix(fixer) {
                const currText = sourceCode.getText(curr);
                return [
                  fixer.remove(curr),
                  fixer.insertTextBefore(prev, currText + "\n"),
                ];
              },
            });
          }

          // Also flag if prev and curr are on the same line (parser recovered)
          if (prev.loc.end.line === curr.loc.start.line) {
            context.report({
              node: curr,
              messageId: "splicedImport",
              fix(fixer) {
                const currText = sourceCode.getText(curr);
                return [
                  fixer.remove(curr),
                  fixer.insertTextBefore(prev, currText + "\n"),
                ];
              },
            });
          }
        }
      },
    };
  },
};