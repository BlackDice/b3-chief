import t from 'tcomb'

import MemoryKey from './MemoryKey'

const Memory = t.declare('Memory')

export const MemoryValue = t.union([
	Memory,
	t.String,
	t.Boolean,
	t.Number,
], 'MemoryValue')

export default Memory.define(t.dict(MemoryKey, MemoryValue))
