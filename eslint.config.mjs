import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['node_modules/**', 'build/**', 'dist/**', '*.js'],
  },
  {
    files: ['**/*.{ts,tsx,js}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      // === Estilo já configurado ===
      semi: ['error', 'never'], // proibir ponto e vírgula
      'no-trailing-spaces': 'error', // proibir espaços ao final da linha
      'eol-last': ['error', 'always'], // exigir linha em branco no final do arquivo
      'no-multiple-empty-lines': ['error', { max: 1 }], // permitir apenas uma linha em branco consecutiva
      quotes: ['error', 'single'], // exigir aspas simples
      'object-curly-spacing': ['error', 'always'], // exigir espaços dentro de objetos
      'comma-dangle': ['error', 'always-multiline'], // exigir vírgula ao final de objetos/arrays
      indent: ['error', 2], // exigir 2 espaços ao invés de tabs
      'arrow-parens': ['error', 'always'], // exigir parênteses em arrow functions
      curly: ['error', 'all'], // exigir chaves em todos os blocos (if/else/for)
      eqeqeq: ['error', 'always'], // exigir === e !==
      'prefer-const': 'error', // usar const sempre que possível
      'no-var': 'error', // proibir var
      'keyword-spacing': ['error', { before: true, after: true }], // espaçamento consistente em palavras-chave
      'space-before-blocks': ['error', 'always'], // exigir espaço antes de {
      'space-in-parens': ['error', 'never'], // proibir espaços dentro de parênteses
      'array-bracket-spacing': ['error', 'never'], // proibir espaços dentro de arrays
      'object-shorthand': ['error', 'always'], // exige o uso da short syntax em objetos
      'operator-linebreak': ['error', 'before'], // define onde a quebra de linha deve ocorrer em expressões com operadores
      'multiline-ternary': ['error', 'always-multiline'], // garante que ternário fique em múltiplas linhas quando apropriado
      'no-unused-vars': 'error',
    },
  },
];
