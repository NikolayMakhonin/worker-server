import {test} from './test'
import {createTestVariants} from '@flemist/test-variants'

describe('worker-server > main', function () {
  this.timeout(600000)

  const testVariants = createTestVariants(function () {
    return Promise.race([
      test.apply(null, arguments),
      new Promise((resolve, reject) => {
        setTimeout(() => {
          reject('Timeout')
        }, 20000)
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
    const promises: (Promise<number>|number)[] = []
    for (let i = 0; i < 10000; i++) {
      promises.push(testVariants({
        funcName: ['func1', 'func2', 'func3'],
        async   : [false, true],
        error   : [false, true],
        abort   : [false, 'error', 'stop'],
        assert  : [true],
      })())
    }
    console.log('variants: ' + (await Promise.all(promises)).reduce((a, o) => a + o, 0))
  })
})
