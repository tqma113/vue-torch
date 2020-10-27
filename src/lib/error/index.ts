import type { Component } from 'vue'

export const createErrorElement = (err: string): Component => {
  return {
    template: `<div>{{err}}</div>`,
    data() {
      return {
        err,
      }
    },
  }
}
