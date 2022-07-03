import {WorkerFunctionClient} from 'src'

export type TestFuncArgs = { value: Float32Array, async: boolean, error: boolean }
export type TestFunc = WorkerFunctionClient<TestFuncArgs, Float32Array>

export const DEBUG = false
