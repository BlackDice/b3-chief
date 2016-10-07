import t from 'tcomb'

import Identity from './Identity'
import SubjectTarget from './SubjectTarget'
import MemoryDictionary from './MemoryDictionary'

export default t.interface({
	id: Identity,
	treeId: Identity,
	target: SubjectTarget,
	memories: t.maybe(MemoryDictionary),
}, {
	name: 'Subject',
	strict: true,
})
