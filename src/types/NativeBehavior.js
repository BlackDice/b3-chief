import t from 'tcomb'

import CamelCase from './CamelCase'
import BehaviorType from './BehaviorType'
import BehaviorConfig from './BehaviorConfig'

export default t.interface({
	name: CamelCase,
	type: BehaviorType,
	config: BehaviorConfig,
	description: t.maybe(t.String),
}, {
	name: 'NativeBehavior',
	strict: true,
})
