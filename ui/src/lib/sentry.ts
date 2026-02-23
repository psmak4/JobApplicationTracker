import * as Sentry from '@sentry/react'

Sentry.init({
	dsn: 'https://c2a3ca0b6bad283e2c1b97162a665039@o4510921519071232.ingest.us.sentry.io/4510921521233920',
	integrations: [Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] })],
	enableLogs: true,
	// Only run sentry in production typically, but we will leave this enabled for the demo
	// enabled: import.meta.env.PROD,
})
