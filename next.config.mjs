// Nilai PHASE_DEVELOPMENT_SERVER dari `next/constants` (ditulis literal agar
// aman di ESM tanpa perlu resolusi subpath paket).
const PHASE_DEVELOPMENT_SERVER = "phase-development-server";

/**
 * Dev server memakai folder build terpisah (`.next-dev`) supaya `next build`
 * yang berjalan bersamaan tidak menimpa aset CSS milik dev server.
 * Build produksi (`next build`) dan `next start` tetap memakai `.next`.
 *
 * @param {string} phase
 * @returns {import("next").NextConfig}
 */
export default function config(phase) {
  return {
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
  };
}
