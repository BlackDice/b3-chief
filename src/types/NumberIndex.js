import t from 'tcomb'

export default t.refinement(t.Number, (value) => value >= 0, 'NumberIndex')
