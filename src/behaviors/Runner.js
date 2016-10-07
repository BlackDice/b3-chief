import { BEHAVIOR_TYPE } from '../const'

const behavior = {
	name: 'Runner',
	type: BEHAVIOR_TYPE.LEAF,
	description: 'This action node returns RUNNING always.',
}

const compilation = {
	tick({ status }) {
		return status.RUNNING
	},
}

export default { behavior, compilation }
