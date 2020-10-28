import { createApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createMemoryHistory } from 'torch-history'
import createRouter from '../../lib/router'
import compile from './compile'
import { createErrorElement } from '../../lib/error'
import { Side } from '../../index'
import { requireDocument, isPromise } from '../../lib/utils'
import type { Request, Response, NextFunction } from 'express'
import type { HtmlProps } from '../../lib/document'
import type { Route, Router, Render } from '../../lib/router'
import type {
  IntegralTorchConfig,
  ServerContext,
  ClientContext,
  PackContext,
} from '../../index'

export default async function createRender(
  config: IntegralTorchConfig,
  packContext: PackContext
) {
  const update = (routes: Route[]) => {
    router = createRouter(routes)
  }
  await compile(config, packContext, update)

  let router: Router
  const applyRouter = (path: string, render: Render) => {
    return router(path, render)
  }

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
          ...packContext,
          req,
          res,
          side: Side.Server,
        }
        const clientContext: ClientContext = {
          ...packContext,
          side: Side.Client,
        }

        const getComponent = async () => {
          try {
            return await pageCreator(history, serverContext)
          } catch (err) {
            return createErrorElement(JSON.stringify(err))
          }
        }
        const component = await getComponent()
        const app = createApp(component)
        const content = await renderToString(app)
        const data: HtmlProps = {
          title: config.title,
          publicPath: '/__torch/',
          context: clientContext,
          container: 'root',
          meta: '',
          content,
          ssr: packContext.ssr,
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
      applyRouter(location.pathname, render)
    } catch (err) {
      res.status(502)
      res.send(err)
    }
  }
}
