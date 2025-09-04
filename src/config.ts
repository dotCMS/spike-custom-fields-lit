interface EnvConfig {
  apiBaseUrl: string;
  appEnv: string;
}

// Configuración centralizada de variables de entorno
export const config: EnvConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  appEnv: import.meta.env.VITE_APP_ENV || '',
};

