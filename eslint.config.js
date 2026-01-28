import js from '@eslint/js';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },
        rules: {
            'no-unused-vars': 'warn',
            'no-console': 'off',
            'indent': ['error', 4],
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            'no-undef': 'error',
            'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
        },
    },
];
