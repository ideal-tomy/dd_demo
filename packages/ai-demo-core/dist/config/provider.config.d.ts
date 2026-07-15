import { ProviderConfig } from '../types/provider.js';
import '../types/access-mode.js';

declare const providerConfigs: ProviderConfig[];
declare function getProviderConfig(id: string): ProviderConfig | undefined;
declare function getEnabledProviders(): ProviderConfig[];

export { getEnabledProviders, getProviderConfig, providerConfigs };
