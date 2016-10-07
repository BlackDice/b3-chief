import t from 'tcomb'

import Identity from './Identity'
import NumberIndex from './NumberIndex'
import BehaviorConfig from './BehaviorConfig'

export default t.interface({
	id: Identity,
	behaviorId: Identity,
	behaviorConfig: BehaviorConfig,
	parentId: t.maybe(Identity),
	childIndex: t.maybe(NumberIndex),
	title: t.maybe(t.String),
}, {
	name: 'Node',
	strict: true,
})
