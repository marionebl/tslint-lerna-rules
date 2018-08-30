import * as Lint from 'tslint';
import * as ts from 'typescript';

/**
 * Test Utilities.
 */
export module Test {

    let program: ts.Program;

    /* tslint:disable:prefer-const */
    /**
     * This setting must point to your rule .js files. 3rd party libraries may reuse this class and change value.
     */
    export let RULES_DIRECTORY: string = 'lib';

    /**
     * This setting must point to your formatter .js files. 3rd party libraries may reuse this class and change value.
     */
    export let FORMATTER_DIRECTORY: string = 'customFormatters/';

    /**
     * You must specify an encoding for file read/writes. 3rd party libraries may reuse this class and change value.
     */
    export let FILE_ENCODING: string = 'utf8';
    /* tslint:enable:prefer-const */

    export interface FailurePosition {
        character: number;
        line: number;
        position?: number;
    }
    export interface Fix {
        innerStart: number;
        innerLength: number;
        innerText: string;
    }
    export interface ExpectedFailure {
        ruleName: string;
        name: string;
        failure?: string;
        ruleSeverity?: string;
        endPosition?: FailurePosition;
        startPosition: FailurePosition;
        fix?: Fix;
    }

    export interface RunRuleOptions {
        ruleName: string;
        userOptions?: string[];
        file: { path: string; contents: string; };
        useTypeChecker?: boolean;
    }

    export function runRule(opts: RunRuleOptions): Lint.LintResult {
        const configuration: Lint.Configuration.IConfigurationFile = {
            extends: [],
            jsRules: new Map<string, Partial<Lint.IOptions>>(),
            linterOptions: {},
            rules: new Map<string, Partial<Lint.IOptions>>(),
            rulesDirectory: []
        };

        if (Array.isArray(opts.userOptions) && opts.userOptions.length > 0) {
            //options like `[4, 'something', false]` were passed, so prepend `true` to make the array like `[true, 4, 'something', false]`
            configuration.rules.set(opts.ruleName, {
                ruleName: opts.ruleName,
                ruleArguments: opts.userOptions
            });
        } else {
            configuration.rules.set(opts.ruleName, {
                ruleName: opts.ruleName
            });
        }

        const options : Lint.ILinterOptions = {
            formatter: 'json',
            fix: false,
            rulesDirectory: RULES_DIRECTORY,
            formattersDirectory: FORMATTER_DIRECTORY
        };

        if (opts.useTypeChecker) {
            const defaultHost = ts.createCompilerHost({});

            program = ts.createProgram([opts.file.path], {}, {
              ...defaultHost,
              getSourceFile(...args): ts.SourceFile {
                const [path, version] = args;

                if (path === opts.file.path) {
                  return ts.createSourceFile(opts.file.path, opts.file.contents, version)
                }

                return defaultHost.getSourceFile(...args);
              },
            });
        }

        const linter = new Lint.Linter(options, opts.useTypeChecker ? program : undefined);

        linter.lint(opts.file.path, opts.file.contents, configuration);

        return linter.getResult();
    }
}
