import pino from 'pino'

// Create a centralized logger instance
export const logger = pino({
	level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
	transport:
		process.env.NODE_ENV !== 'production'
			? {
					target: 'pino-pretty',
					options: {
						colorize: true,
						translateTime: 'SYS:standard',
						ignore: 'pid,hostname',
					},
				}
			: undefined,
})
