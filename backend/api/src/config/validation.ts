// Simple environment validation without external libs
export function validate(config: Record<string, any>) {
	const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];
	for (const key of requiredVars) {
		if (!config[key]) {
			// Allow defaults to handle missing vars in dev, but warn in logs
			// eslint-disable-next-line no-console
			console.warn(`Warning: environment variable ${key} is not set. Using default if available.`);
		}
	}
	return config;
}


