// ═══════════════════════════════════════════════════════════════
// SITA OS — Test Mock Factories
// ═══════════════════════════════════════════════════════════════

export function buildUser(overrides: Record<string, any> = {}) {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    email: "test@sita.os",
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export function buildDocument(overrides: Record<string, any> = {}) {
  return {
    id: crypto.randomUUID(),
    user_id: "00000000-0000-0000-0000-000000000001",
    title: "Test Document",
    content: "Test content",
    doc_type: "doc",
    status: "draft",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

export function buildNote(overrides: Record<string, any> = {}) {
  return {
    id: crypto.randomUUID(),
    user_id: "00000000-0000-0000-0000-000000000001",
    title: "Test Note",
    content: "Test content",
    folder: "general",
    tags: ["test"],
    pinned: false,
    starred: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

export function buildCalendarEvent(overrides: Record<string, any> = {}) {
  return {
    id: crypto.randomUUID(),
    user_id: "00000000-0000-0000-0000-000000000001",
    title: "Test Event",
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 3600000).toISOString(),
    event_type: "meeting",
    ...overrides,
  };
}

export function buildCustomer(overrides: Record<string, any> = {}) {
  return {
    id: crypto.randomUUID(),
    user_id: "00000000-0000-0000-0000-000000000001",
    name: "Test Customer",
    email: "customer@test.com",
    status: "active",
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export function buildReceipt(overrides: Record<string, any> = {}) {
  return {
    id: crypto.randomUUID(),
    user_id: "00000000-0000-0000-0000-000000000001",
    capability_key: "test.capability",
    mode: "demo",
    model_id: "gpt-4",
    provider_id: "openai",
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export function buildWorkflow(overrides: Record<string, any> = {}) {
  return {
    id: crypto.randomUUID(),
    user_id: "00000000-0000-0000-0000-000000000001",
    name: "Test Workflow",
    status: "active",
    steps: [],
    created_at: new Date().toISOString(),
    ...overrides,
  };
}
