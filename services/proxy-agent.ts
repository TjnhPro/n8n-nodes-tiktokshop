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

	const split = lowered.split('://');
	if(split.length < 2){
		throw new ProxyConfigurationError(
			`Unsupported proxy protocol for value "${proxy}"`,
		);
	}

	const type = split[0];
	const [host, port, user, pass] = split[1].split(':');
	let url = '';

	if(user && pass){
		url = `${type}://${user}:${pass}@${host}:${port}`;
	}
	else{
		url = `${type}://${host}:${port}`;
	}

	if (type.startsWith('http')) {
		return new HttpsProxyAgent(url);
	}

	if (type.startsWith('socks5')) {
		return new SocksProxyAgent(url);
	}

	throw new ProxyConfigurationError(
		`Unsupported proxy protocol for value "${proxy}". Expected empty, http*, or socks5*.`,
	);
}
