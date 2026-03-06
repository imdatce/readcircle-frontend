import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sura.app',
  appName: 'SURA',
  webDir: 'out',
  server: {
    url: 'http://172.20.10.14:3000', // <-- Bulduğun IP adresi ve 3000 portu
    cleartext: true
  }
};

export default config;