import {
  getEnvApiKey,
  getModels,
  getProviders,
  registerBuiltInApiProviders,
  type KnownProvider,
  type Model,
} from "@earendil-works/pi-ai";
import { readConfig } from "./config.js";
import type {
  HarnessConfig,
  HarnessRunOptions,
  ModelInfo,
  ProfileInfo,
  ProviderInfo,
  ProviderProfile,
} from "./types.js";

export type ModelSelection = {
  profileName: string;
  profile: ProviderProfile | undefined;
  model: Model<any>;
  apiKeyEnv: string | undefined;
};

let providersRegistered = false;

export function ensureProvidersRegistered() {
  if (providersRegistered) return;
  registerBuiltInApiProviders();
  providersRegistered = true;
}

function knownProvider(provider: string): KnownProvider {
  ensureProvidersRegistered();

  const providers = getProviders();
  if (!providers.includes(provider as KnownProvider)) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  return provider as KnownProvider;
}

export function selectModel(config: HarnessConfig, options: HarnessRunOptions): ModelSelection {
  ensureProvidersRegistered();

  const profileName = options.profileName ?? config.defaultProfile;
  const profile = config.profiles[profileName];
  if (!profile && !options.provider) {
    throw new Error(`Unknown profile: ${profileName}`);
  }

  const provider = options.provider ?? profile?.provider;
  const modelId = options.model ?? profile?.model;
  if (!provider || !modelId) {
    throw new Error("Provider and model are required");
  }

  const baseModel = getModels(knownProvider(provider)).find((candidate) => candidate.id === modelId);
  if (!baseModel) {
    throw new Error(`Unknown model for ${provider}: ${modelId}`);
  }
  let model = profile?.baseUrl ? { ...baseModel, baseUrl: profile.baseUrl } : baseModel;
  if (profile?.remoteModelId) {
    model = { ...model, id: profile.remoteModelId };
  }
  if (profile?.maxTokens) {
    model = { ...model, maxTokens: profile.maxTokens };
  }

  return {
    profileName,
    profile,
    model,
    apiKeyEnv: profile?.apiKeyEnv,
  };
}

export function getModelApiKey(selection: ModelSelection): string | undefined {
  return (
    process.env.PI_API_KEY ??
    (selection.apiKeyEnv ? process.env[selection.apiKeyEnv] : undefined) ??
    getEnvApiKey(selection.model.provider)
  );
}

export function listProfiles(config = readConfig()): ProfileInfo[] {
  return Object.entries(config.profiles).map(([name, profile]) => ({
    name,
    provider: profile.provider,
    model: profile.model,
    apiKeyEnv: profile.apiKeyEnv,
    isDefault: name === config.defaultProfile,
    hasKey: Boolean(profile.apiKeyEnv && process.env[profile.apiKeyEnv]),
  }));
}

export function listProviders(config = readConfig()): ProviderInfo[] {
  ensureProvidersRegistered();

  const profileProviders = new Set(Object.values(config.profiles).map((profile) => profile.provider));
  return getProviders().sort().map((provider) => ({
    provider,
    isProfileProvider: profileProviders.has(provider),
  }));
}

export function listModels(providerArg?: string, config = readConfig()): ModelInfo[] {
  ensureProvidersRegistered();

  const provider = providerArg ?? config.profiles[config.defaultProfile]?.provider;
  if (!provider) {
    throw new Error("Provider is required for models command");
  }

  return getModels(knownProvider(provider)).map((model) => ({
    id: model.id,
    name: model.name,
    contextWindow: model.contextWindow,
    maxTokens: model.maxTokens,
  }));
}
