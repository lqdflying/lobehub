import { UserStore } from '@/store/user';
import {
  AzureOpenAIKeyVault,
  GlobalLLMProviderKey,
  OpenAICompatibleKeyVault,
  UserKeyVaults,
} from '@/types/user/settings';

import { currentSettings } from '../../settings/selectors/settings';

export const keyVaultsSettings = (s: UserStore): UserKeyVaults =>
  currentSettings(s).keyVaults || {};

const openAIConfig = (s: UserStore) => keyVaultsSettings(s).openai || {};
const azureConfig = (s: UserStore) => keyVaultsSettings(s).azure || {};
const getVaultByProvider = (provider: GlobalLLMProviderKey) => (s: UserStore) =>
  (keyVaultsSettings(s)[provider] || {}) as OpenAICompatibleKeyVault & AzureOpenAIKeyVault;

const isProviderEndpointNotEmpty = (provider: string) => (s: UserStore) => {
  const vault = getVaultByProvider(provider as GlobalLLMProviderKey)(s);
  return !!vault?.baseURL || !!vault?.endpoint;
};

const isProviderApiKeyNotEmpty = (provider: string) => (s: UserStore) => {
  const vault = getVaultByProvider(provider as GlobalLLMProviderKey)(s);
  return !!vault?.apiKey;
};

const password = (s: UserStore) => keyVaultsSettings(s).password || '';

export const keyVaultsConfigSelectors = {
  azureConfig,
  getVaultByProvider,
  isProviderApiKeyNotEmpty,
  isProviderEndpointNotEmpty,
  keyVaultsSettings,
  openAIConfig,
  password,
};
