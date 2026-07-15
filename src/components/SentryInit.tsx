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

        // sentry.client.config.ts is auto-injected by withSentryConfig in production;
        // only init here if that file did not already run (Turbopack dev mode).
        if (Sentry.isInitialized()) return;

        Sentry.init({
            dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
            tracesSampleRate: 1.0,
            debug: false,
            replaysSessionSampleRate: 0.1,
            replaysOnErrorSampleRate: 1.0,
            integrations: [
                Sentry.replayIntegration({
                    maskAllText: true,
                    blockAllMedia: true,
                }),
                Sentry.captureConsoleIntegration({ levels: ["warn", "error"] }),
            ],
        });
    }, []);

    return null; // This component renders nothing to the DOM
}
