'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

/**
 * Bulletproof Sentry Initialization
 * 
 * Since Next.js Turbopack currently strips out Webpack plugins during dev,
 * the auto-injector fails to load sentry.client.config.ts.
 * We manually initialize it here inside a useEffect to guarantee it only 
 * runs in the browser, completely avoiding SSR crashes.
 */
export default function SentryInit() {
    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

        Sentry.init({
            dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
            tracesSampleRate: 1.0,
            debug: true, // We will leave this on for testing
            replaysSessionSampleRate: 1.0, // Force 100% replay recording for testing
            replaysOnErrorSampleRate: 1.0,
            integrations: [
                Sentry.replayIntegration({
                    maskAllText: true,
                    blockAllMedia: true,
                }),
                Sentry.feedbackIntegration({
                    colorScheme: "system",
                    autoInject: true, // Force the floating bug widget to appear
                }),
                Sentry.captureConsoleIntegration({ levels: ["log", "warn", "error"] })
            ],
        });
        
        console.log("🚀 Sentry Client Component successfully initialized!");
    }, []);

    return null; // This component renders nothing to the DOM
}
