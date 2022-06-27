import {TestFunc} from './contracts'
import {func1, func2, func3} from './main'
import {WorkerData} from '../common/contracts'
import {AbortControllerFast, AbortError} from '@flemist/abort-controller-fast'

function createArray(...values: number[]): Float32Array {
  const array = new Float32Array(values)
  return array
}

function parseArray(array: Float32Array): number[] {
  return array && Array.from(array.values())
}

let nextId = 1

export async function test({
  funcName,
  async,
  error,
  abort,
  assert: _assert,
  options,
}: {
  funcName: string,
  async: boolean,
  error: boolean,
  abort: false | 'error' | 'stop',
  assert: boolean,
  options: {
    globalMaxNotAbortedErrors?: number,
  } | null,
}) {
  let id = nextId++
  console.debug(`=============== START ${id} ===============`)
  type TValues = number[]
  const values: TValues = [10, 20, 30, id]
  let func: TestFunc
  let checkResult: {
    callbacks: TValues[],
    result?: TValues,
    errorMessage?: string,
  }
  
  let errorMessage = error ? (async ? 'func1' : funcName)
    : abort === 'error' && async ? 'abort'
      : void 0

  switch (funcName) {
    case 'func1':
      func = func1
      if (_assert) {
        checkResult = {
          callbacks: error || abort && async
            ? [[10, 20, 30, id], [11, 20, 30, id]]
            : [[10, 20, 30, id], [11, 20, 30, id]],
          result: error || abort && async ? void 0 : [12, 20, 30, id],
          errorMessage,
        }
      }
      break
    case 'func2':
      func = func2
      if (_assert) {
        checkResult = {
          callbacks: async
            ? (error || abort
              ? [[10, 20, 30, id], [10, 21, 30, id], [10, 21, 30, id], [11, 21, 30, id]]
              : [[10, 20, 30, id], [10, 21, 30, id], [10, 21, 30, id], [11, 21, 30, id]])
            : (error
              ? [[10, 20, 30, id], [10, 21, 30, id]]
              : [[10, 20, 30, id], [10, 21, 30, id]]),
          result: error || abort && async ? void 0
            : (async ? [12, 22, 30, id] : [10, 22, 30, id]),
          errorMessage,
        }
      }
      break
    case 'func3':
      func = func3
      if (_assert) {
        checkResult = {
          callbacks: async
            ? (error || abort
              ? [[10, 20, 30, id], [10, 20, 31, id], [10, 20, 31, id], [11, 20, 31, id]]
              : [[10, 20, 30, id], [10, 20, 31, id], [10, 20, 31, id], [11, 20, 31, id]])
            : (error
              ? [[10, 20, 30, id], [10, 20, 31, id]]
              : [[10, 20, 30, id], [10, 20, 31, id]]),
          result: error || abort && async ? void 0
            : (async ? [12, 20, 32, id] : [10, 20, 32, id]),
          errorMessage,
        }
      }
      break
    default:
      throw new Error('Unknown func name: ' + funcName)
  }

  const value = createArray(...values)
  if (_assert) {
    assert.strictEqual(value.length, values.length)
  }
  const callbacks: TValues[] = []
  let result: WorkerData<Float32Array>
  errorMessage = void 0

  const abortController = new AbortControllerFast()
  const promise = func(
    {
      data        : {value, async, error},
      transferList: [value.buffer],
    },
    abortController.signal,
    (data) => {
      if (_assert) {
        assert.strictEqual(data.transferList.length, 1)
        assert.strictEqual(data.transferList[0], data.data.buffer)
      }
      callbacks.push(parseArray(data.data))
    },
  )

  if (_assert) {
    assert.strictEqual(value.length, 0)
  }

  if (abort === 'error') {
    abortController.abort('abort')
  }
  else if (abort === 'stop') {
    abortController.abort(null)
  }

  try {
    result = await promise
    if (abortController.signal.aborted && abort !== 'stop' && async) {
      if (options?.globalMaxNotAbortedErrors > 0) {
        options.globalMaxNotAbortedErrors--
      }
      else {
        assert.fail('func is not aborted')
      }
    }
  }
  catch (err) {
    assert.ok(err)
    if (typeof err === 'string') {
      errorMessage = err
    }
    else if (err instanceof AbortError) {
      errorMessage = err.reason
    }
    else if (err.message.length <= 20) {
      errorMessage = err.message
    }
    else {
      throw err
    }
  }

  if (_assert) {
    const actualResult = {
      callbacks,
      result: parseArray(result?.data),
      errorMessage,
    }
    assert.deepStrictEqual(actualResult, checkResult)

    if (checkResult.result) {
      assert.strictEqual(result.transferList.length, 1)
      assert.strictEqual(result.transferList[0], result.data.buffer)
    }
    else if (error || abort === 'error') {
      assert.deepStrictEqual(result, void 0)
    }
    else {
      assert.deepStrictEqual(result, {
        data        : void 0,
        transferList: void 0,
      })
    }
  }

  console.debug(`=============== END ${id} ===============`)
}
