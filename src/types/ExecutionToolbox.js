import t from 'tcomb'

export default t.interface({
	status: t.Object,
	timestamp: t.Function,
	error: t.Function,
}, 'ExecutionToolbox')
