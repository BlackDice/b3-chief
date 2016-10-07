import t from 'tcomb'

import Model from './Model'
import BehaviorType from './BehaviorType'
import Compilation from './Compilation'

export default t.interface({
	node: Model,
	type: BehaviorType,
	config: t.Object,
	compilation: Compilation,
}, 'ExecutionNode')
