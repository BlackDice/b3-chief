import t from 'tcomb'

const rx = /[A-Za-z0-9]+/

export default t.refinement(t.String, (value) => rx.test(value), 'MemoryKey')
