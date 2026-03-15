import { describe, it, expect, beforeEach } from 'vitest';
import {
  setSHARPContext,
  getSHARPContext,
  clearSHARPContext,
  hasFHIRAccess,
  extractSHARPFromHeaders,
  buildFHIRHeaders,
  fetchFHIRResource,
} from '../src/sharp-context.js';

describe('SHARP Context Propagation', () => {
  beforeEach(() => {
    clearSHARPContext();
  });

  describe('setSHARPContext / getSHARPContext', () => {
    it('should store and retrieve context', () => {
      setSHARPContext({ fhirServerUrl: 'https://fhir.example.org/r4', patientId: 'p123' });
      const ctx = getSHARPContext();
      expect(ctx?.fhirServerUrl).toBe('https://fhir.example.org/r4');
      expect(ctx?.patientId).toBe('p123');
    });

    it('should return null when no context set', () => {
      expect(getSHARPContext()).toBeNull();
    });

    it('should return a copy (not a reference)', () => {
      setSHARPContext({ fhirServerUrl: 'https://fhir.example.org/r4' });
      const ctx1 = getSHARPContext();
      const ctx2 = getSHARPContext();
      expect(ctx1).not.toBe(ctx2);
      expect(ctx1).toEqual(ctx2);
    });

    it('should store all fields', () => {
      setSHARPContext({
        fhirServerUrl: 'https://fhir.example.org/r4',
        patientId: 'p123',
        accessToken: 'tok_abc',
        tokenType: 'Bearer',
        expiresAt: '2026-03-15T12:00:00Z',
        scopes: ['patient/Patient.read'],
        practitionerId: 'prac-1',
        encounterId: 'enc-1',
        organizationId: 'org-1',
      });
      const ctx = getSHARPContext();
      expect(ctx?.accessToken).toBe('tok_abc');
      expect(ctx?.practitionerId).toBe('prac-1');
      expect(ctx?.encounterId).toBe('enc-1');
      expect(ctx?.organizationId).toBe('org-1');
      expect(ctx?.scopes).toEqual(['patient/Patient.read']);
    });
  });

  describe('clearSHARPContext', () => {
    it('should clear the context', () => {
      setSHARPContext({ fhirServerUrl: 'https://fhir.example.org/r4' });
      clearSHARPContext();
      expect(getSHARPContext()).toBeNull();
    });
  });

  describe('hasFHIRAccess', () => {
    it('should return false when no context', () => {
      expect(hasFHIRAccess()).toBe(false);
    });

    it('should return false without access token', () => {
      setSHARPContext({ fhirServerUrl: 'https://fhir.example.org/r4' });
      expect(hasFHIRAccess()).toBe(false);
    });

    it('should return false without FHIR server URL', () => {
      setSHARPContext({ accessToken: 'tok_abc' });
      expect(hasFHIRAccess()).toBe(false);
    });

    it('should return true with both URL and token', () => {
      setSHARPContext({ fhirServerUrl: 'https://fhir.example.org/r4', accessToken: 'tok_abc' });
      expect(hasFHIRAccess()).toBe(true);
    });
  });

  describe('extractSHARPFromHeaders', () => {
    it('should extract FHIR server URL', () => {
      const ctx = extractSHARPFromHeaders({ 'x-sharp-fhir-server': 'https://fhir.example.org/r4' });
      expect(ctx.fhirServerUrl).toBe('https://fhir.example.org/r4');
    });

    it('should extract alternative FHIR server header', () => {
      const ctx = extractSHARPFromHeaders({ 'x-fhir-server-url': 'https://alt.fhir.org/r4' });
      expect(ctx.fhirServerUrl).toBe('https://alt.fhir.org/r4');
    });

    it('should extract patient ID', () => {
      const ctx = extractSHARPFromHeaders({ 'x-sharp-patient-id': 'patient-456' });
      expect(ctx.patientId).toBe('patient-456');
    });

    it('should extract alternative patient ID header', () => {
      const ctx = extractSHARPFromHeaders({ 'x-patient-id': 'patient-789' });
      expect(ctx.patientId).toBe('patient-789');
    });

    it('should extract Bearer token from Authorization header', () => {
      const ctx = extractSHARPFromHeaders({ 'authorization': 'Bearer tok_xyz' });
      expect(ctx.accessToken).toBe('tok_xyz');
      expect(ctx.tokenType).toBe('Bearer');
    });

    it('should ignore non-Bearer authorization', () => {
      const ctx = extractSHARPFromHeaders({ 'authorization': 'Basic dXNlcjpwYXNz' });
      expect(ctx.accessToken).toBeUndefined();
    });

    it('should extract SHARP access token header', () => {
      const ctx = extractSHARPFromHeaders({ 'x-sharp-access-token': 'direct_token' });
      expect(ctx.accessToken).toBe('direct_token');
    });

    it('should parse scopes from space-separated string', () => {
      const ctx = extractSHARPFromHeaders({
        'x-sharp-scopes': 'patient/Patient.read patient/Observation.read',
      });
      expect(ctx.scopes).toEqual(['patient/Patient.read', 'patient/Observation.read']);
    });

    it('should extract practitioner ID', () => {
      const ctx = extractSHARPFromHeaders({ 'x-sharp-practitioner-id': 'prac-001' });
      expect(ctx.practitionerId).toBe('prac-001');
    });

    it('should extract encounter ID', () => {
      const ctx = extractSHARPFromHeaders({ 'x-sharp-encounter-id': 'enc-001' });
      expect(ctx.encounterId).toBe('enc-001');
    });

    it('should extract organization ID', () => {
      const ctx = extractSHARPFromHeaders({ 'x-sharp-organization-id': 'org-001' });
      expect(ctx.organizationId).toBe('org-001');
    });

    it('should extract expiry timestamp', () => {
      const ctx = extractSHARPFromHeaders({ 'x-sharp-expires-at': '2026-03-15T12:00:00Z' });
      expect(ctx.expiresAt).toBe('2026-03-15T12:00:00Z');
    });

    it('should handle empty headers gracefully', () => {
      const ctx = extractSHARPFromHeaders({});
      expect(ctx.fhirServerUrl).toBeUndefined();
      expect(ctx.patientId).toBeUndefined();
      expect(ctx.accessToken).toBeUndefined();
    });

    it('should extract multiple headers at once', () => {
      const ctx = extractSHARPFromHeaders({
        'x-sharp-fhir-server': 'https://fhir.example.org/r4',
        'x-sharp-patient-id': 'p123',
        'authorization': 'Bearer tok_full',
        'x-sharp-scopes': 'patient/*.read',
        'x-sharp-practitioner-id': 'dr-smith',
      });
      expect(ctx.fhirServerUrl).toBe('https://fhir.example.org/r4');
      expect(ctx.patientId).toBe('p123');
      expect(ctx.accessToken).toBe('tok_full');
      expect(ctx.scopes).toEqual(['patient/*.read']);
      expect(ctx.practitionerId).toBe('dr-smith');
    });
  });

  describe('buildFHIRHeaders', () => {
    it('should include FHIR content type headers', () => {
      const headers = buildFHIRHeaders({});
      expect(headers['Accept']).toBe('application/fhir+json');
      expect(headers['Content-Type']).toBe('application/fhir+json');
    });

    it('should include authorization when token present', () => {
      const headers = buildFHIRHeaders({ accessToken: 'tok_abc', tokenType: 'Bearer' });
      expect(headers['Authorization']).toBe('Bearer tok_abc');
    });

    it('should default to Bearer token type', () => {
      const headers = buildFHIRHeaders({ accessToken: 'tok_abc' });
      expect(headers['Authorization']).toBe('Bearer tok_abc');
    });

    it('should not include Authorization without token', () => {
      const headers = buildFHIRHeaders({});
      expect(headers['Authorization']).toBeUndefined();
    });
  });

  describe('fetchFHIRResource', () => {
    it('should return error when no SHARP context available', async () => {
      const result = await fetchFHIRResource('Patient');
      expect('error' in result).toBe(true);
      expect(result.fromFHIR).toBe(false);
    });

    it('should return error when context lacks credentials', async () => {
      setSHARPContext({ fhirServerUrl: 'https://fhir.example.org/r4' });
      const result = await fetchFHIRResource('Patient');
      expect('error' in result).toBe(true);
      expect(result.fromFHIR).toBe(false);
    });
  });
});

describe('Agent Card', () => {
  it('should return valid agent card', async () => {
    const { getAgentCard } = await import('../src/agent-card.js');
    const card = getAgentCard();
    expect(card.name).toBe('healthbridge');
    expect(card.version).toBe('1.0.0');
    expect(card.capabilities.mcp.tools).toHaveLength(19);
    expect(card.capabilities.mcp.resources).toHaveLength(5);
    expect(card.capabilities.mcp.prompts).toHaveLength(4);
    expect(card.capabilities.fhir.resourceTypes).toContain('Patient');
    expect(card.capabilities.sharp.contextAware).toBe(true);
    expect(card.tags).toContain('sharp');
    expect(card.tags).toContain('fhir');
  });
});

describe('Server Factory', () => {
  it('should create a valid MCP server', async () => {
    const { createHealthBridgeServer } = await import('../src/server-factory.js');
    const server = createHealthBridgeServer();
    expect(server).toBeDefined();
  });
});
