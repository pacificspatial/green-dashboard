import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
    // グローバルに無視するファイル
    {
        ignores: ['dist/**', 'bin/**'],
    },

    // JavaScript/JSXファイルの設定
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        plugins: {
            react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            // ESLint推奨ルール
            ...js.configs.recommended.rules,

            // React推奨ルール
            ...react.configs.recommended.rules,
            ...react.configs['jsx-runtime'].rules,

            // React Hooks推奨ルール
            ...reactHooks.configs.recommended.rules,

            // カスタムルール
            'no-unused-vars': ['warn'],
            'react/react-in-jsx-scope': 'off',
            'react/jsx-uses-react': 'off',
            'react-hooks/exhaustive-deps': 'off',
            'react-refresh/only-export-components': 'off',
            'react/display-name': 'off',
            'no-empty': ['error', { allowEmptyCatch: true }],
            'react/prop-types': 'off', // PropTypesを使用している場合は'warn'に変更
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
]