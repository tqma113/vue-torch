/// <reference types="node" />
/// <reference types="vue" />

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: import('./index').Env
  }

  interface Global {
    __DEV__: boolean
  }
}

interface Window {
  __TORCH_DATA__: import('./index').TorchData
  __DEV__: boolean
}

declare var __DEV__: boolean

declare module '@routes' {
  declare const routes: import('./index').Route[]
  export = routes
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'detect-port-alt' {
  declare function detect(defaultPort: number, host: string): Promise<number>
  export = detect
}