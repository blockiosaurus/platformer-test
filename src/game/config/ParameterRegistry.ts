import { EventBus } from '../EventBus';
import { PlayerParameters } from './types';
import { getDefaultParameters, PARAMETER_DEFINITIONS } from './PlayerParameters';

type ParameterListener = (key: string, value: number) => void;

export class ParameterRegistry {
  private values: Map<string, number>;
  private defaults: Map<string, number>;
  private listeners: Set<ParameterListener>;

  constructor(initialValues?: Partial<PlayerParameters>) {
    this.values = new Map();
    this.defaults = new Map();
    this.listeners = new Set();

    // Initialize with defaults
    const defaults = getDefaultParameters();
    for (const [key, value] of Object.entries(defaults)) {
      this.values.set(key, value);
      this.defaults.set(key, value);
    }

    // Override with initial values if provided
    if (initialValues) {
      for (const [key, value] of Object.entries(initialValues)) {
        if (typeof value === 'number') {
          this.values.set(key, value);
        }
      }
    }
  }

  get(key: string): number {
    return this.values.get(key) ?? 0;
  }

  set(key: string, value: number): void {
    const oldValue = this.values.get(key);
    if (oldValue !== value) {
      this.values.set(key, value);
      this.notifyListeners(key, value);
      EventBus.emit('parameter-changed', { key, value });
    }
  }

  subscribe(listener: ParameterListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(key: string, value: number): void {
    for (const listener of this.listeners) {
      listener(key, value);
    }
  }

  loadPreset(preset: Partial<PlayerParameters>): void {
    for (const [key, value] of Object.entries(preset)) {
      if (typeof value === 'number') {
        this.set(key, value);
      }
    }
    EventBus.emit('preset-loaded', preset);
  }

  reset(): void {
    for (const [key, value] of this.defaults) {
      this.set(key, value);
    }
    EventBus.emit('parameters-reset');
  }

  getSnapshot(): PlayerParameters {
    const snapshot: Partial<PlayerParameters> = {};
    for (const [key, value] of this.values) {
      (snapshot as Record<string, number>)[key] = value;
    }
    return snapshot as PlayerParameters;
  }

  exportJSON(): string {
    return JSON.stringify(this.getSnapshot(), null, 2);
  }

  importJSON(json: string): boolean {
    try {
      const parsed = JSON.parse(json);

      // Validate that all keys exist in our definitions
      const validKeys = new Set(PARAMETER_DEFINITIONS.map(d => d.key));
      for (const key of Object.keys(parsed)) {
        if (!validKeys.has(key)) {
          console.warn(`Unknown parameter key: ${key}`);
        }
      }

      // Apply valid parameters
      for (const [key, value] of Object.entries(parsed)) {
        if (validKeys.has(key) && typeof value === 'number') {
          this.set(key, value);
        }
      }

      EventBus.emit('parameters-imported');
      return true;
    } catch (e) {
      console.error('Failed to import parameters:', e);
      return false;
    }
  }
}

// Singleton instance for global access
let globalRegistry: ParameterRegistry | null = null;

export function getGlobalRegistry(): ParameterRegistry {
  if (!globalRegistry) {
    globalRegistry = new ParameterRegistry();
  }
  return globalRegistry;
}

export function setGlobalRegistry(registry: ParameterRegistry): void {
  globalRegistry = registry;
}
