export const ALL_CONNECTIONS = 'ALL_CONNECTIONS'

export function routePush(route: string[] | null, connectionId: string) {
  if (!connectionId) {
    throw new Error('connectionId == null')
  }
  if (!route) {
    throw new Error('route == null')
  }
  route.push(connectionId)
  return route
}

export function routePop(route: string[] | null, connectionId: string) {
  if (!connectionId) {
    throw new Error('connectionId == null')
  }
  if (!route) {
    throw new Error('route == null')
  }
  const len = route?.length || 0
  if (!len || route[len - 1] !== connectionId && route[len - 1] !== ALL_CONNECTIONS) {
    return false
  }
  route.length = len - 1
  return true
}
