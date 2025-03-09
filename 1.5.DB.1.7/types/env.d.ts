declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_USER: string;
      DB_HOST: string;
      DB_NAME: string;
      DB_PASSWORD: string;
      DB_PORT: string;
      JWT_SECRET: string;
    }
  }
}

// Ensure this file is treated as a module
export {};