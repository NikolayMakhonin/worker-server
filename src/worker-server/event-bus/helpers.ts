export function createListener(listeners: Set<(arg: any) => void>) {
  return function listener(arg: any) {
    listeners.forEach(_listener => {
      try {
        _listener(arg)
      }
      catch (err) {
        console.error(err)
      }
    })
  }
}
