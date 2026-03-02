import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sura.app',
  appName: 'SURA',
  webDir: 'out',
  server: {
    cleartext: true // iOS'un yerel ağdaki HTTP isteklerine izin vermesini sağlar
  }
};

export default config;