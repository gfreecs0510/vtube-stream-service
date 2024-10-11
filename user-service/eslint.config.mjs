import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  {
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'error', // Enforce return type annotations
      '@typescript-eslint/explicit-module-boundary-types': 'error', // Enforce return type annotations on functions and class methods
      '@typescript-eslint/no-inferrable-types': 'warn', // Warn on explicit type declarations where TypeScript can infer the type
      '@typescript-eslint/typedef': [
        'error',
        {
          arrayDestructuring: false,
          arrowParameter: true,
          memberVariableDeclaration: true,
          objectDestructuring: false,
          parameter: true,
          propertyDeclaration: true,
          variableDeclaration: false,
        },
      ],
    },
  }
);