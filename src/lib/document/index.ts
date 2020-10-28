import type {
  Context,
  StylePreload,
  ScriptPreload,
  TorchData,
} from '../../index'

export type HtmlProps = {
  title: string
  meta: string
  context: Context
  publicPath: string
  container: string
  ssr: boolean
  content: string
  assets: {
    vendor: string
    index: string
  }
  styles?: StylePreload[]
  scripts?: ScriptPreload[]
}

export const createHtml = ({
  title,
  meta,
  context,
  publicPath,
  container,
  ssr,
  content,
  assets,
  styles = [],
  scripts = [],
}: HtmlProps) => {
  const data: TorchData = {
    context,
    container,
  }

  const styleElements = styles.map(getStyle)

  const scriptElements = scripts.map(getScript)

  const vendor = getSrcScript(`${publicPath}${assets.vendor}`, 'vendor')
  const index = getSrcScript(`${publicPath}${assets.index}`, 'index')

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <title>${title}</title>
      ${meta}
      ${styleElements}
      ${scriptElements}
    </head>
    <body>
      <noscript>
        <strong>
          We're sorry but ${title} doesn't work properly without JavaScript
          enabled.You need to enable JavaScript to run this app.
        </strong>
      </noscript>

      <div id="${container}" data-server-rendered="${ssr}">
        ${content}
      </div>

      <script id="__TORCH_DATA__" type="application/json">
        ${JSON.stringify(data).replace(/</g, '\\u003c')}
      </script>

      <script>
        (function() {
          window.__DEV__ = ${context.env === 'development'}
        })()
      </script>

      ${vendor}
      ${index}
    </body>
  </html>
  `
}

function getStyle(style: StylePreload) {
  return style.type === 'link'
    ? getStyleLink(style.href)
    : getInnerStyle(style.content)
}

function getInnerStyle(content: string) {
  return `
    <style type="text/css" >
    ${content}
    </style>
  `
}

function getStyleLink(href: string) {
  return `<link rel="stylesheet" type="text/css" href="${href}" />`
}

function getScript(script: ScriptPreload) {
  return script.type == 'inner'
    ? getInnerScript(script.content)
    : getSrcScript(script.src)
}

function getSrcScript(src: string, key?: string | number) {
  return `<script src="${src}" type="application/javascript"></script>`
}

function getInnerScript(content: string, key?: string | number) {
  return `
  <script type="application/javascript">
    ${content}
  </script>`
}
