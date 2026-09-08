export interface AppModule {
  moduleId: string;
  name: string;
}

export const APPS: readonly AppModule[] = [
  { moduleId: "demo-landing", name: "Demo Landing" },
  { moduleId: "demo-service", name: "Demo Service" },
] as const;

export function appName(moduleId: string): string {
  return APPS.find((app) => app.moduleId === moduleId)?.name ?? moduleId;
}
