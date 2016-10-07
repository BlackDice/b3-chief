import t from 'tcomb'

import Identity from './Identity'
import NativeBehavior from './NativeBehavior'

export default NativeBehavior.extend({
	id: Identity,
	definition: t.String,
	maxChildren: t.maybe(t.Number),
	meta: t.maybe(t.Object),
}, {
	name: 'Behavior',
	strict: true,
})
