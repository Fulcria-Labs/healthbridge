/**
 * HTTP/SSE Transport for HealthBridge MCP Server
 *
 * Enables HealthBridge to run as an HTTP service (in addition to stdio),
 * which is required for Prompt Opinion marketplace publishing.
 * Supports Server-Sent Events (SSE) for MCP message streaming.
 *
 * Usage:
 *   npm run serve          # Start HTTP server on port 3000
 *   npm run serve -- 8080  # Custom port
 *
 * Endpoints:
 *   GET  /                  → Agent card (JSON)
 *   GET  /health            → Health check
 *   POST /mcp               → MCP JSON-RPC over HTTP
 *   GET  /sse               → MCP over Server-Sent Events
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { getAgentCard } from './agent-card.js';
import { extractSHARPFromHeaders, setSHARPContext } from './sharp-context.js';
import { createHealthBridgeServer } from './server-factory.js';

const PORT = parseInt(process.argv[2] || process.env.PORT || '3000', 10);

function cors(res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Sharp-*');
}

function json(res: ServerResponse, data: unknown, status = 200) {
  cors(res);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const sseTransports = new Map<string, SSEServerTransport>();

async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  // Extract SHARP context from incoming headers
  const headers: Record<string, string> = {};
  for (const [key, val] of Object.entries(req.headers)) {
    if (typeof val === 'string') headers[key.toLowerCase()] = val;
  }
  const sharpCtx = extractSHARPFromHeaders(headers);
  if (sharpCtx.fhirServerUrl || sharpCtx.patientId) {
    setSHARPContext(sharpCtx);
  }

  // CORS preflight
  if (req.method === 'OPTIONS') {
    cors(res);
    res.writeHead(204);
    res.end();
    return;
  }

  // Agent card / discovery
  if (url.pathname === '/' && req.method === 'GET') {
    return json(res, getAgentCard());
  }

  // Health check
  if (url.pathname === '/health' && req.method === 'GET') {
    return json(res, { status: 'ok', name: 'healthbridge', version: '1.0.0' });
  }

  // SSE endpoint for MCP
  if (url.pathname === '/sse' && req.method === 'GET') {
    const server = createHealthBridgeServer();
    const transport = new SSEServerTransport('/messages', res);
    sseTransports.set(transport.sessionId, transport);

    res.on('close', () => {
      sseTransports.delete(transport.sessionId);
    });

    await server.connect(transport);
    return;
  }

  // SSE message endpoint
  if (url.pathname === '/messages' && req.method === 'POST') {
    const sessionId = url.searchParams.get('sessionId');
    if (!sessionId || !sseTransports.has(sessionId)) {
      return json(res, { error: 'Invalid session' }, 400);
    }
    const transport = sseTransports.get(sessionId)!;
    await transport.handlePostMessage(req, res);
    return;
  }

  // 404
  json(res, { error: 'Not found' }, 404);
}

const httpServer = createServer(handler);
httpServer.listen(PORT, () => {
  console.log(`HealthBridge MCP Server (HTTP/SSE) running on port ${PORT}`);
  console.log(`  Agent card:  http://localhost:${PORT}/`);
  console.log(`  Health:      http://localhost:${PORT}/health`);
  console.log(`  MCP (SSE):   http://localhost:${PORT}/sse`);
});
