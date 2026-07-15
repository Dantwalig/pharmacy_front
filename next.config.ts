import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default withSentryConfig(nextConfig, {
  org: "ubwenge-lab",
  project: "evuze",
  silent: !process.env.CI,
  widenClientFileUpload: true,
})
