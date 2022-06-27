import {test} from './test'
import {createTestVariants} from '@flemist/test-variants'
import {delay} from '@flemist/async-utils'
import {AbortControllerFast} from "@flemist/abort-controller-fast";

describe('worker-server > main', function () {
  this.timeout(600000)

  const testVariants = createTestVariants((args: {
    funcName: string,
    async: boolean,
    error: boolean,
    abort: false | 'error' | 'stop',
    assert: boolean,
  }) => {
    return Promise.race<number|void>([
      test(args),
      new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          reject('Timeout')
        }, 30000)
      }),
    ])
  })

  it('simple', async function () {
    await testVariants({
      funcName: ['func2', 'func1', 'func3'],
      async   : [true, false],
      error   : [false, true],
      abort   : ['stop', 'error', false],
      assert  : [true],
    })()
  })

  it('stress', async function () {
    const abortController = new AbortControllerFast()
    let firstErrorEvent
    const promises: (Promise<number>|number)[] = []
    for (let i = 0; i < 10000; i++) {
      promises.push(testVariants({
        funcName: ['func1', 'func2', 'func3'],
        async   : [false, true],
        error   : [false, true],
        abort   : [false, 'error', 'stop'],
        assert  : [true],
      })({
        onError(errorEvent) {
          firstErrorEvent = errorEvent
        },
        abortSignal: abortController.signal,
      }))
    }
    try {
      console.log('variants: ' + (await Promise.all(promises)).reduce((a, o) => a + o, 0))
    }
    catch (err) {
      abortController.abort()
      await delay(1000)
      if (!firstErrorEvent) {
        console.log(`firstErrorEvent is null`)
        throw err
      }
      console.error(`iteration: ${
        firstErrorEvent.iteration
      }}\r\n${
        firstErrorEvent.variant
      }}`)
      console.error(firstErrorEvent.error)
      throw firstErrorEvent.error
    }
  })
})
