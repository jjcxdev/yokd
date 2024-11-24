declare module '@eslint-community/eslint-plugin-eslint-comments/configs';
declare module 'eslint-config-prettier';
declare module 'eslint-plugin-security';
declare module 'eslint-plugin-tailwindcss';

interface ImportMetaEnv {
  readonly DATABASE_URL: string;
  readonly DATABASE_AUTH_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
