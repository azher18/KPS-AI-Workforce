// ============================================================================
// KPS AI Workforce - Frontend API Client
// ============================================================================

export async function fetchJson<T = any>(url: string, options?: RequestInit): Promise<T> {
  const activeTenantId = localStorage.getItem('kps_active_tenant_id') || 'org_apex_realestate';
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-tenant-id': activeTenantId,
    ...(options?.headers as Record<string, string> || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}
