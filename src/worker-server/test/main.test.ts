/* eslint-disable @typescript-eslint/no-loop-func */
import {test} from './test'
import {createTestVariants} from '@flemist/test-variants'
import {delay, rejectAsResolve} from '@flemist/async-utils'
import {AbortControllerFast} from '@flemist/abort-controller-fast'
import {terminateWorkers} from 'src/worker-server/test/main'

describe('worker-server > main', function () {
  this.timeout(600000)

  const testVariants = createTestVariants((args: {
    funcName: string,
    async: boolean,
    error: boolean,
    abort: false | 'error' | 'stop',
    assert: boolean,
    options: {
      globalMaxNotAbortedErrors?: number,
    } | null,
  }) => {
    return Promise.race<number|void>([
      test(args),
      new Promise<void>((resolve) => {
        setTimeout(() => {
          rejectAsResolve(resolve, 'Timeout')
        }, 60000)
      }),
    ])
  })

  after(async () => {
    await terminateWorkers()
  })

  it('simple', async function () {
    await testVariants({
      funcName: ['func2', 'func1', 'func3'],
      async   : [true, false],
      error   : [false, true],
      abort   : ['stop', 'error', false],
      assert  : [true],
      options : [null],
    })()
  })

  it('stress', async function () {
    const abortController = new AbortControllerFast()
    let firstErrorEvent
    const options = {
      globalMaxNotAbortedErrors: 5,
    }
    const promises: (Promise<number>|number)[] = []
    for (let i = 0; i < 1000; i++) {
      promises.push(testVariants({
        funcName: ['func1', 'func2', 'func3'],
        async   : [false, true],
        error   : [false, true],
        abort   : [false, 'error', 'stop'],
        assert  : [true],
        options : [options],
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
      await delay(15000)
      if (!firstErrorEvent) {
        console.log(`firstErrorEvent is null`)
        throw err
      }
      console.error(`iteration: ${
        firstErrorEvent.iteration
      }}\r\n${
        JSON.stringify(firstErrorEvent.variant, null, 2)
      }}`)
      console.error(firstErrorEvent.error)
      throw firstErrorEvent.error
    }
  })
})
