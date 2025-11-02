/**
 * Relayer SDK dynamic loader (CDN-based)
 * Based on reference implementation
 */

import { FHEVM_CONSTANTS } from "./constants";

type FhevmRelayerSDKType = {
  initSDK: (options?: any) => Promise<boolean>;
  createInstance: (config: any) => Promise<any>;
  SepoliaConfig: any;
  __initialized__?: boolean;
};

type FhevmWindowType = {
  relayerSDK: FhevmRelayerSDKType;
};

type TraceType = (message?: unknown, ...optionalParams: unknown[]) => void;

export class RelayerSDKLoader {
  private _trace?: TraceType;

  constructor(options: { trace?: TraceType } = {}) {
    this._trace = options.trace;
  }

  public isLoaded(): boolean {
    if (typeof window === "undefined") {
      throw new Error("RelayerSDKLoader: can only be used in the browser.");
    }
    return isFhevmWindowType(window, this._trace);
  }

  public load(): Promise<void> {
    console.log("[RelayerSDKLoader] load...");
    
    // Ensure this only runs in the browser
    if (typeof window === "undefined") {
      console.log("[RelayerSDKLoader] window === undefined");
      return Promise.reject(
        new Error("RelayerSDKLoader: can only be used in the browser.")
      );
    }

    // Check if already loaded
    if ("relayerSDK" in window) {
      if (!isFhevmRelayerSDKType((window as any).relayerSDK, this._trace)) {
        console.log("[RelayerSDKLoader] window.relayerSDK === undefined");
        throw new Error("RelayerSDKLoader: Unable to load FHEVM Relayer SDK");
      }
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const cdnUrl = FHEVM_CONSTANTS.RELAYER_SDK_CDN;
      const existingScript = document.querySelector(`script[src="${cdnUrl}"]`);
      
      if (existingScript) {
        if (!isFhevmWindowType(window as any, this._trace)) {
          reject(
            new Error(
              "RelayerSDKLoader: window object does not contain a valid relayerSDK object."
            )
          );
        }
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = cdnUrl;
      script.type = "text/javascript";
      script.async = true;

      script.onload = () => {
        if (!isFhevmWindowType(window as any, this._trace)) {
          console.log("[RelayerSDKLoader] script onload FAILED...");
          reject(
            new Error(
              `RelayerSDKLoader: Relayer SDK script loaded from ${cdnUrl}, but window.relayerSDK is invalid.`
            )
          );
        }
        resolve();
      };

      script.onerror = () => {
        console.log("[RelayerSDKLoader] script onerror...");
        reject(
          new Error(`RelayerSDKLoader: Failed to load Relayer SDK from ${cdnUrl}`)
        );
      };

      console.log("[RelayerSDKLoader] add script to DOM...");
      document.head.appendChild(script);
      console.log("[RelayerSDKLoader] script added!");
    });
  }

  public getSDK(): FhevmRelayerSDKType | null {
    if (typeof window === "undefined") return null;
    return (window as any).relayerSDK || null;
  }
}

function isFhevmRelayerSDKType(
  o: unknown,
  trace?: TraceType
): o is FhevmRelayerSDKType {
  if (typeof o === "undefined") {
    trace?.("RelayerSDKLoader: relayerSDK is undefined");
    return false;
  }
  if (o === null) {
    trace?.("RelayerSDKLoader: relayerSDK is null");
    return false;
  }
  if (typeof o !== "object") {
    trace?.("RelayerSDKLoader: relayerSDK is not an object");
    return false;
  }
  if (!objHasProperty(o, "initSDK", "function", trace)) {
    trace?.("RelayerSDKLoader: relayerSDK.initSDK is invalid");
    return false;
  }
  if (!objHasProperty(o, "createInstance", "function", trace)) {
    trace?.("RelayerSDKLoader: relayerSDK.createInstance is invalid");
    return false;
  }
  if (!objHasProperty(o, "SepoliaConfig", "object", trace)) {
    trace?.("RelayerSDKLoader: relayerSDK.SepoliaConfig is invalid");
    return false;
  }
  if ("__initialized__" in o) {
    if (o.__initialized__ !== true && o.__initialized__ !== false) {
      trace?.("RelayerSDKLoader: relayerSDK.__initialized__ is invalid");
      return false;
    }
  }
  return true;
}

export function isFhevmWindowType(
  win: unknown,
  trace?: TraceType
): win is FhevmWindowType {
  if (typeof win === "undefined") {
    trace?.("RelayerSDKLoader: window object is undefined");
    return false;
  }
  if (win === null) {
    trace?.("RelayerSDKLoader: window object is null");
    return false;
  }
  if (typeof win !== "object") {
    trace?.("RelayerSDKLoader: window is not an object");
    return false;
  }
  if (!("relayerSDK" in win)) {
    trace?.("RelayerSDKLoader: window does not contain 'relayerSDK' property");
    return false;
  }
  return isFhevmRelayerSDKType((win as any).relayerSDK);
}

function objHasProperty<T extends object, K extends PropertyKey, V extends string>(
  obj: T,
  propertyName: K,
  propertyType: V,
  trace?: TraceType
): boolean {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  if (!(propertyName in obj)) {
    trace?.(`RelayerSDKLoader: missing ${String(propertyName)}.`);
    return false;
  }

  const value = (obj as Record<K, unknown>)[propertyName];

  if (value === null || value === undefined) {
    trace?.(`RelayerSDKLoader: ${String(propertyName)} is null or undefined.`);
    return false;
  }

  if (typeof value !== propertyType) {
    trace?.(`RelayerSDKLoader: ${String(propertyName)} is not a ${propertyType}.`);
    return false;
  }

  return true;
}

/**
 * Load Relayer SDK dynamically
 */
export async function loadRelayerSDK(): Promise<any> {
  const loader = new RelayerSDKLoader();
  
  if (loader.isLoaded()) {
    return loader.getSDK();
  }

  await loader.load();
  return loader.getSDK();
}

/**
 * Create Relayer instance
 */
export async function createRelayerInstance(config: any): Promise<any> {
  const sdk = await loadRelayerSDK();
  
  if (!sdk || !sdk.createInstance) {
    throw new Error("Relayer SDK not properly loaded");
  }

  try {
    // Initialize SDK if not already done
    if (!sdk.__initialized__) {
      await sdk.initSDK();
    }

    const instance = await sdk.createInstance(config);
    console.log("✅ Created Relayer instance");
    return instance;
  } catch (error) {
    console.error("Failed to create Relayer instance:", error);
    throw error;
  }
}
