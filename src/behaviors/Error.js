import { BEHAVIOR_TYPE } from '../const'

const behavior = {
	name: 'Error',
	type: BEHAVIOR_TYPE.LEAF,
	description: 'This action node returns ERROR always.',
}

const compilation = {
	tick({ status }) {
		return status.ERROR
	},
}

export default { behavior, compilation }
