import type { Route } from '../../src'

const routes: Route[] = [
  {
    path: '/',
    module: () => import('./Home'),
  }
]

export default routes
