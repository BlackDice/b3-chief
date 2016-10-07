import t from 'tcomb'

const rx = /[A-Z][A-Za-z]+/

export default t.refinement(t.String, (value) => rx.test(value), 'CamelCase')
