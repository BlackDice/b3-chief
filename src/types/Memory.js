import t from 'tcomb'

import MemoryKey from './MemoryKey'

const Memory = t.declare('Memory')
const MemoryValue = t.declare('MemoryValue')

MemoryValue.define(t.union([
	Memory,
	t.String,
	t.Boolean,
	t.Number,
	t.Array,
]))

export { MemoryValue }
export default Memory.define(t.dict(MemoryKey, MemoryValue))
