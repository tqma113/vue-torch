import type { Plugin } from '@vue/runtime-core'

export interface Unsubscribe {
  (): void
}

export type StoreLike<S extends object> = Plugin & {
  subscribe(listener: () => void): Unsubscribe
  state: S
  replaceState(state: S): void
}

export const createNoopStore = (): StoreLike<any> => {
  return {
    subscribe: () => {
      return () => {}
    },
    get state() {
      return {}
    },
    replaceState: (state) => {},
    install: () => {}
  }
}
