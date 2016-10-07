import { BEHAVIOR_TYPE } from '../const'

const behavior = {
	name: 'Failer',
	type: BEHAVIOR_TYPE.LEAF,
	description: 'This action node returns FAILURE always.',
}

const compilation = {
	tick({ status }) {
		return status.FAILURE
	},
}

export default { behavior, compilation }
