import { createApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createMemoryHistory } from 'torch-history'
import createRouter from '../../lib/router'
import getRoutes from './getRoutes'
import { createErrorElement } from '../../lib/error'
import { Side } from '../../index'
import { getViewAndStoreFromPage } from '../../lib/page'
import { requireDocument, isPromise } from '../../lib/utils'
import type { Route, Render } from '../../lib/router'
import type { Request, Response, NextFunction } from 'express'
import type { HtmlProps } from '../../lib/document'
import type {
  IntegralTorchConfig,
  ClientContext,
  ServerContext,
} from '../../index'

export default function createRender(config: IntegralTorchConfig) {
  let routes: Route[] = getRoutes(config)

  if (!routes) {
    throw new Error('You need run `npm run build` before `npm start`!')
  }

  const router = createRouter(routes)

  return function (req: Request, res: Response, next: NextFunction) {
    const history = createMemoryHistory()
    history.push(req.url)
    const location = history.location

    const render: Render = async (pct) => {
      if (pct === null) {
        next()
      } else {
        const pageCreator = isPromise(pct) ? await pct : pct
        const serverContext: ServerContext = {
          req,
          res,
          ssr: config.ssr,
          env: process.env.NODE_ENV,
          side: Side.Server,
        }
        const clientContext: ClientContext = {
          ssr: config.ssr,
          env: process.env.NODE_ENV,
          side: Side.Client,
        }
        const getComponentAndState = async () => {
          try {
            const page = await pageCreator(history, serverContext)
            const [component, store] = getViewAndStoreFromPage(page)
            return [component, store.state]
          } catch (err) {
            return [createErrorElement(JSON.stringify(err)), {}] as const
          }
        }

        const [component, state] = await getComponentAndState()
        const app = createApp(component)
        const content = await renderToString(app)
        const data: HtmlProps = {
          title: config.title,
          publicPath: '/__torch/',
          context: clientContext,
          container: 'root',
          meta: '',
          content,
          state,
          ssr: config.ssr,
          ...res.locals,
          assets: res.locals.assets,
          styles: res.locals.styles,
          scripts: res.locals.scripts,
        }
        const createHtml = requireDocument(config)
        const html = createHtml(data)
        res.status(200)
        res.setHeader('Content-type', 'text/html')
        res.end(html)
      }
    }

    try {
      router(location.pathname, render)
    } catch (err) {
      res.status(502)
      res.send(err)
    }
  }
}
