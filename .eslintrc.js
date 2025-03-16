module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier"],
  rules: {
    "prettier/prettier": "error",
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": ["error"]
  }
};
