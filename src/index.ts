#!/usr/bin/env node

/**
 * HealthBridge MCP Server — stdio entry point
 *
 * A Clinical Decision Support MCP server for healthcare AI agents.
 * Provides tools for drug interaction checking, clinical risk score calculation,
 * lab result interpretation, and FHIR patient data summarization.
 *
 * Built for the "Agents Assemble" Healthcare AI Hackathon.
 * SHARP-aware for healthcare context propagation via Prompt Opinion.
 *
 * Entry points:
 *   npm start   → stdio transport (default, for local MCP clients)
 *   npm run serve → HTTP/SSE transport (for marketplace publishing)
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createHealthBridgeServer } from './server-factory.js';

const server = createHealthBridgeServer();

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('HealthBridge MCP Server running on stdio');
}

main().catch(console.error);
