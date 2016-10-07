import t from 'tcomb'

import Identity from './Identity'
import CamelCase from './CamelCase'
import NodeDictionary from './NodeDictionary'

export default t.interface({
	id: Identity,
	name: CamelCase,
	description: t.maybe(t.String),
	nodes: t.maybe(NodeDictionary),
}, {
	name: 'Tree',
	strict: true,
})
