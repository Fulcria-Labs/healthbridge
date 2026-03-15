/**
 * SHARP (Substitutable Health Apps, Reusable Platform) Context Propagation
 *
 * Implements healthcare context propagation for MCP tools.
 * SHARP enables tools to receive and pass along patient context (patient ID,
 * FHIR server URL, authorization tokens) through multi-agent call chains
 * without requiring each tool to handle auth independently.
 *
 * When HealthBridge runs inside Prompt Opinion, the platform injects SHARP
 * context via MCP transport metadata. Tools can then use this context to
 * fetch live patient data from a FHIR server.
 */

export interface SHARPContext {
  /** FHIR server base URL (e.g., https://fhir.example.org/r4) */
  fhirServerUrl?: string;
  /** Patient ID for scoped data access */
  patientId?: string;
  /** OAuth2 bearer token for FHIR server access */
  accessToken?: string;
  /** Token type (typically "Bearer") */
  tokenType?: string;
  /** Token expiration timestamp (ISO 8601) */
  expiresAt?: string;
  /** Scopes granted (e.g., "patient/Patient.read patient/Observation.read") */
  scopes?: string[];
  /** Practitioner ID if available */
  practitionerId?: string;
  /** Encounter ID for session-scoped context */
  encounterId?: string;
  /** Organization ID */
  organizationId?: string;
}

// Global context store — set when a SHARP-aware transport initializes
let currentContext: SHARPContext | null = null;

/**
 * Set the current SHARP context (called by transport layer).
 */
export function setSHARPContext(ctx: SHARPContext): void {
  currentContext = { ...ctx };
}

/**
 * Get the current SHARP context. Returns null if no context is set
 * (e.g., running in stdio mode without platform integration).
 */
export function getSHARPContext(): SHARPContext | null {
  return currentContext ? { ...currentContext } : null;
}

/**
 * Clear the current SHARP context.
 */
export function clearSHARPContext(): void {
  currentContext = null;
}

/**
 * Check if SHARP context is available and has valid FHIR credentials.
 */
export function hasFHIRAccess(): boolean {
  return !!(currentContext?.fhirServerUrl && currentContext?.accessToken);
}

/**
 * Extract SHARP context from MCP transport metadata headers.
 * Prompt Opinion injects these when proxying to marketplace tools.
 */
export function extractSHARPFromHeaders(headers: Record<string, string>): SHARPContext {
  const ctx: SHARPContext = {};

  if (headers['x-sharp-fhir-server'] || headers['x-fhir-server-url']) {
    ctx.fhirServerUrl = headers['x-sharp-fhir-server'] || headers['x-fhir-server-url'];
  }
  if (headers['x-sharp-patient-id'] || headers['x-patient-id']) {
    ctx.patientId = headers['x-sharp-patient-id'] || headers['x-patient-id'];
  }
  if (headers['authorization']) {
    const auth = headers['authorization'];
    if (auth.startsWith('Bearer ')) {
      ctx.accessToken = auth.slice(7);
      ctx.tokenType = 'Bearer';
    }
  }
  if (headers['x-sharp-access-token']) {
    ctx.accessToken = headers['x-sharp-access-token'];
    ctx.tokenType = 'Bearer';
  }
  if (headers['x-sharp-scopes']) {
    ctx.scopes = headers['x-sharp-scopes'].split(/\s+/);
  }
  if (headers['x-sharp-practitioner-id']) {
    ctx.practitionerId = headers['x-sharp-practitioner-id'];
  }
  if (headers['x-sharp-encounter-id']) {
    ctx.encounterId = headers['x-sharp-encounter-id'];
  }
  if (headers['x-sharp-organization-id']) {
    ctx.organizationId = headers['x-sharp-organization-id'];
  }
  if (headers['x-sharp-expires-at']) {
    ctx.expiresAt = headers['x-sharp-expires-at'];
  }

  return ctx;
}

/**
 * Build authorization headers for FHIR server requests using SHARP context.
 */
export function buildFHIRHeaders(ctx: SHARPContext): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/fhir+json',
    'Content-Type': 'application/fhir+json',
  };
  if (ctx.accessToken) {
    headers['Authorization'] = `${ctx.tokenType || 'Bearer'} ${ctx.accessToken}`;
  }
  return headers;
}

/**
 * Fetch a FHIR resource using the current SHARP context.
 * Falls back gracefully when no SHARP context is available.
 */
export async function fetchFHIRResource(
  resourceType: string,
  id?: string,
  params?: Record<string, string>,
): Promise<{ data: any; fromFHIR: boolean } | { error: string; fromFHIR: false }> {
  const ctx = getSHARPContext();

  if (!ctx?.fhirServerUrl || !ctx?.accessToken) {
    return {
      error: 'No SHARP/FHIR context available. Using local data.',
      fromFHIR: false,
    };
  }

  let url = `${ctx.fhirServerUrl}/${resourceType}`;
  if (id) url += `/${id}`;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    if (qs) url += `?${qs}`;
  }

  // Scope patient context when available
  if (ctx.patientId && !id && !params?.['patient']) {
    const sep = url.includes('?') ? '&' : '?';
    url += `${sep}patient=${ctx.patientId}`;
  }

  try {
    const resp = await fetch(url, {
      headers: buildFHIRHeaders(ctx),
    });

    if (!resp.ok) {
      return {
        error: `FHIR request failed: ${resp.status} ${resp.statusText}`,
        fromFHIR: false,
      };
    }

    return {
      data: await resp.json(),
      fromFHIR: true,
    };
  } catch (err) {
    return {
      error: `FHIR request error: ${err instanceof Error ? err.message : 'unknown'}`,
      fromFHIR: false,
    };
  }
}
