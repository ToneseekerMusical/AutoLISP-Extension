// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';


export default defineConfig(
	{
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
		}
	},
	eslint.configs.recommended,
	tseslint.configs.recommended,
	{
		ignores: [
			'.vscode/**',
			'.vscode-test/**',
			'images/**',

			'out/**',
			'utils/**',
		]
	},
	{
		rules: {
			'no-unused-expressions': 'off', // disable original rule
			'@typescript-eslint/no-unused-expressions': 'error', // disable original rule
		},
		files: ['**/*.test.ts', '**/*.test.js', 'extension/src/test/e2e/debugConfig.ts']
	}
);

/*
export default defineConfig(
	eslint.configs.recommended,
	tseslint.configs.recommended,
	{
		plugins: { 'chai-friendly': pluginChaiFriendly },
		files: ['extension/src/test\**\/*.@(ts|js|mts|cts)'],
		rules: {
			'no-unused-expressions': 'off', 
			'@typescript-eslint/no-unused-expressions': 'off', 
			'chai-friendly/no-unused-expressions': 'error',
		},
	},
);
*/