export function validateEnvVariables(vars: string[]) {
  const missing = vars.filter((v) => !process.env[v]);
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }
}

export function getEnv(name: string, fallback?: string) {
  return process.env[name] ?? fallback;
}
