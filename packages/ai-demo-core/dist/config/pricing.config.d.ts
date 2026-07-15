import { PricingConfig } from '../types/usage.js';
import '../types/access-mode.js';

/**
 * Approximate public list prices converted to JPY for demo cost display.
 * Not an invoice. Update `updatedAt` when revising.
 * USD→JPY approximate rate: 150
 */
declare const pricingConfig: PricingConfig;

export { pricingConfig };
