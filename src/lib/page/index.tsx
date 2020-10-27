import type { History } from 'torch-history'
import type { Context } from '../../index'
import type { Component } from 'vue'

export type Page = Component

export type Creater = (
  history: History,
  context: Context
) => Page | Promise<Page>

export type PageCreater = Creater & {
  symbol: Symbol
}

const TORCH_PAGE_SYMBOL = Symbol('TORCH_PAGE')

export function createPage(creater: Creater): PageCreater {
  return Object.assign(creater, {
    symbol: TORCH_PAGE_SYMBOL,
  })
}

export const isTorchPage = (input: any): input is PageCreater => {
  return typeof input === 'function' && input.symbol === TORCH_PAGE_SYMBOL
}
