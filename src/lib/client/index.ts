import { createApp } from 'vue'
import invariant from 'tiny-invariant'
import { createBrowserHistory } from 'torch-history'
import createRouter from '../router'
import { createErrorElement } from '../error'
import $routes from '@routes'
import type { Listener } from 'torch-history'
import type { TorchData } from '../../index'
import type { Render } from '../router'

const dataScript = document.getElementById(
  '__TORCH_DATA__'
) as HTMLScriptElement | null
if (dataScript) {
  const jsonStr = dataScript.textContent
  if (jsonStr) {
    const history = createBrowserHistory({ window })
    const location = history.location

    try {
      const data: TorchData = JSON.parse(jsonStr)
      const { context, container } = data

      window.__TORCH_DATA__ = data

      const router = createRouter($routes)

      const listener: Listener = async ({ location }) => {
        const render: Render = async (pageCreator) => {
          if (pageCreator === null) {
            const error = new Error(`Unknow path: ${location.pathname}`)
            const msg = JSON.stringify(error)
            const app = createApp(createErrorElement(msg))
            app.mount(`#${container}`)
          } else {
            if (isPromise(pageCreator)) {
              pageCreator = await pageCreator
            }
            const ctx = {
              ...context,
              ssr: false,
            }
            const page = await pageCreator(history, ctx)
            const app = createApp(page)
            const containerElement = document.querySelector(`#${container}`)

            invariant(
              containerElement !== null,
              `The container: ${container} is not exist`
            )

            app.mount(`#${container}`)
          }
        }

        router(location.pathname, render)
      }

      const init: Render = async (pageCreator) => {
        if (pageCreator === null) {
          const error = new Error(`Unknow path: ${location.pathname}`)
          const msg = JSON.stringify(error)
          const page = createErrorElement(msg)
          const app = createApp(page)
          const containerElement = document.querySelector(`#${container}`)

          invariant(
            containerElement !== null,
            `The container: ${container} is not exist`
          )

          app.mount(`#${container}`)
        } else {
          if (isPromise(pageCreator)) {
            pageCreator = await pageCreator
          }
          const page = await pageCreator(history, context)
          const app = createApp(page)
          const containerElement = document.querySelector(`#${container}`)

          invariant(
            containerElement !== null,
            `The container: ${container} is not exist`
          )

          app.mount(`#${container}`, context.ssr)

          history.listen(listener)
        }
      }

      router(location.pathname, init)
    } catch (err) {
      console.error(err)
    }
  } else {
    console.error('SSR failed.')
  }
} else {
  console.error("SSR failed. Can' find __TORCH_DATA__ script element!")
}

function isPromise<T, S>(obj: PromiseLike<T> | S): obj is PromiseLike<T> {
  // @ts-ignore
  return obj && obj.then && typeof obj.then === 'function'
}
