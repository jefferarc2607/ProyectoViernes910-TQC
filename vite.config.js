import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true,
    allowedHosts: [
      'sixty-wasps-kiss.loca.lt',
      '100.64.0.13',
      '192.168.56.1',
      '172.16.0.228',
      'localhost'
    ]
  }
})