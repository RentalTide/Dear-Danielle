/**
 * Feature flag utilities for Dear Danielle MVP.
 *
 * Flags are defined in src/config/configFeatureFlags.js and merged
 * into the app config. Access them via:
 *   const config = useConfiguration();
 *   if (isFeatureEnabled(config, 'enableCart')) { ... }
 *
 * Environment variable overrides:
 *   REACT_APP_FF_ENABLE_CART=true  →  enableCart = true
 */

const ENV_PREFIX = 'REACT_APP_FF_';

/**
 * Convert a camelCase flag name to SCREAMING_SNAKE_CASE env var name.
 * e.g. enableCart → REACT_APP_FF_ENABLE_CART
 */
const flagToEnvVar = flagName =>
  ENV_PREFIX + flagName.replace(/([A-Z])/g, '_$1').toUpperCase();

/**
 * Check whether a feature flag is enabled.
 * Priority: env var override > config value > false.
 *
 * @param {Object} config - App configuration from useConfiguration()
 * @param {string} flagName - Flag key, e.g. 'enableCart'
 * @returns {boolean}
 */
export const isFeatureEnabled = (config, flagName) => {
  // Check environment variable override first
  const envVar = flagToEnvVar(flagName);
  const envValue = typeof process !== 'undefined' ? process.env[envVar] : undefined;
  if (envValue === 'true') return true;
  if (envValue === 'false') return false;

  // Fall back to config value
  return config?.featureFlags?.[flagName] === true;
};
