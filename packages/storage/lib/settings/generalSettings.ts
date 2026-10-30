import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

// Interface for general settings configuration
export interface GeneralSettingsConfig {
  maxSteps: number;
  maxActionsPerStep: number;
  maxFailures: number;
  useVision: boolean;
  useVisionForPlanner: boolean;
  planningInterval: number;
  displayHighlights: boolean;
  minWaitPageLoad: number;
  replayHistoricalTasks: boolean;
}

export type GeneralSettingsStorage = BaseStorage<GeneralSettingsConfig> & {
  updateSettings: (settings: Partial<GeneralSettingsConfig>) => Promise<void>;
  getSettings: () => Promise<GeneralSettingsConfig>;
  resetToDefaults: () => Promise<void>;
};

// Default settings
export const DEFAULT_GENERAL_SETTINGS: GeneralSettingsConfig = {
  maxSteps: 100,
  maxActionsPerStep: 5,
  maxFailures: 3,
  useVision: false,
  useVisionForPlanner: false,
  planningInterval: 3,
  displayHighlights: true,
  minWaitPageLoad: 250,
  replayHistoricalTasks: false,
};

function normalizeNumber(value: number | undefined, current: number, min: number, max: number): number {
  if (value === undefined || !Number.isFinite(value) || !Number.isInteger(value)) return current;
  return Math.min(max, Math.max(min, value));
}

function normalizeSettings(settings: Partial<GeneralSettingsConfig>): GeneralSettingsConfig {
  const normalized = { ...DEFAULT_GENERAL_SETTINGS, ...settings };
  normalized.maxSteps = normalizeNumber(settings.maxSteps, DEFAULT_GENERAL_SETTINGS.maxSteps, 1, 100);
  normalized.maxActionsPerStep = normalizeNumber(settings.maxActionsPerStep, DEFAULT_GENERAL_SETTINGS.maxActionsPerStep, 1, 50);
  normalized.maxFailures = normalizeNumber(settings.maxFailures, DEFAULT_GENERAL_SETTINGS.maxFailures, 1, 10);
  normalized.planningInterval = normalizeNumber(settings.planningInterval, DEFAULT_GENERAL_SETTINGS.planningInterval, 1, 20);
  normalized.minWaitPageLoad = normalizeNumber(settings.minWaitPageLoad, DEFAULT_GENERAL_SETTINGS.minWaitPageLoad, 250, 5000);
  return normalized;
}

const storage = createStorage<GeneralSettingsConfig>('general-settings', DEFAULT_GENERAL_SETTINGS, {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

export const generalSettingsStore: GeneralSettingsStorage = {
  ...storage,
  async updateSettings(settings: Partial<GeneralSettingsConfig>) {
    const currentSettings = normalizeSettings(await storage.get());
    const updatedSettings = normalizeSettings({ ...currentSettings, ...settings });

    // If useVision is true, displayHighlights must also be true
    if (updatedSettings.useVision && !updatedSettings.displayHighlights) {
      updatedSettings.displayHighlights = true;
    }

    await storage.set(updatedSettings);
  },
  async getSettings() {
    return normalizeSettings(await storage.get());
  },
  async resetToDefaults() {
    await storage.set(DEFAULT_GENERAL_SETTINGS);
  },
};
