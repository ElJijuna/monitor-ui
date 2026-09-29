import { createEslintConfig } from 'super-configs/eslint';

export default createEslintConfig({
  language: 'ts',
  react: true,
  testFramework: 'jest',
  ignores: ['dist/**', 'coverage/**', 'storybook-static/**', 'node_modules/**'],
});
