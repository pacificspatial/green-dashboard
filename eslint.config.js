import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import react from "eslint-plugin-react"
import {defineConfig, globalIgnores} from 'eslint/config'

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{js,jsx}'],
        ignores: ['bin/**/*'],
        extends: [
            js.configs.recommended,
            react.configs.flat.recommended,
            reactHooks.configs['recommended-latest'],
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: {jsx: true},
                sourceType: 'module',
            },
        },
        plugins: {
            react,
        },
        settings: {
            react: {
                version: "detect",
            }
        },
        rules: {
            'no-unused-vars': ['error', {varsIgnorePattern: '^[A-Z_]'}],
            'react/react-in-jsx-scope': 'off',
            'react/jsx-uses-react': 'off',
            'react-hooks/exhaustive-deps': 'off',
            'react-refresh/only-export-components': 'off',
            'react/display-name': 'off',
            "no-empty": ["error", {"allowEmptyCatch": true}]
        },
    },
])
