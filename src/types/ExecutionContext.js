import t from 'tcomb'

import ExecutionToolbox from './ExecutionToolbox'

export default ExecutionToolbox.extend({
	config: t.Object,
	memory: t.Object,
	treeMemory: t.Object,
	subjectMemory: t.Object,
}, 'ExecutionContext')

