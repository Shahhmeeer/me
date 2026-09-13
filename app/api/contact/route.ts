/**
 * The contact form's route (ADR-0004). The handler and everything it does
 * are in `handler.ts`, where a test can call it with fakes; this file is
 * the name Next.js looks for, and only binds the real one to `POST`.
 */
export { default as POST } from "./handler";
