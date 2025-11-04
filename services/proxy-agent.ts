import type { Agent as HttpAgent } from 'node:http';
import type { Agent as HttpsAgent } from 'node:https';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';

export type ProxyAgent = HttpAgent | HttpsAgent;

export class ProxyConfigurationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ProxyConfigurationError';
	}
}

export function createProxyAgent(proxy?: string): ProxyAgent | undefined {
	if (!proxy || !proxy.trim()) {
		return undefined;
	}

	const normalized = proxy.trim();
	const lowered = normalized.toLowerCase();

	if (lowered.startsWith('http')) {
		return new HttpsProxyAgent(normalized);
	}

	if (lowered.startsWith('socks5')) {
		return new SocksProxyAgent(normalized);
	}

	throw new ProxyConfigurationError(
		`Unsupported proxy protocol for value "${proxy}". Expected empty, http*, or socks5*.`,
	);
}
