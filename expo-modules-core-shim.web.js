// Shim for expo-modules-core on web
// Provides missing registerWebModule function

export function registerWebModule(module, name) {
  // No-op on web - modules are loaded via bundler
  return null;
}

export const NativeModulesProxy = {};

export default {
  registerWebModule,
  NativeModulesProxy,
};
