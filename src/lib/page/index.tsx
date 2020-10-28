import { createNoopStore } from '../store'
import type { History } from 'torch-history'
import type { Component } from 'vue'
import type { Context } from '../../index'
import type { StoreLike } from '../store'

export type Page = [Component, StoreLike<any>] | Component

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

export const getViewAndStoreFromPage = (page: Page) => {
  return isArray(page) ? page : ([page, createNoopStore()] as const)
}

function isArray<A, B, S>(input: [A, B] | S): input is [A, B] {
  return Array.isArray(input)
}
