import { describe, it, expect } from 'vitest';

describe('API Health', () => {
  it('should export health route', async () => {
    const healthModule = await import('../src/app/api/health/route');
    expect(healthModule).toBeDefined();
  });
});

describe('API Customer Analysis', () => {
  it('should export customer analysis route', async () => {
    const module = await import('../src/app/api/customer-analysis/route');
    expect(module).toBeDefined();
  });
});

describe('Components', () => {
  it('should have error boundary', async () => {
    const module = await import('../src/components/error-boundary');
    expect(module.ErrorBoundary).toBeDefined();
  });
  
  it('should have layout component', async () => {
    const module = await import('../src/components/layout/ZAEPLayout');
    expect(module.default).toBeDefined();
  });
});
