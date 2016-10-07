import t from 'tcomb'

const rx = /[a-z0-9]+/i

export default t.refinement(t.String, (value) => rx.test(value), 'Identity')
