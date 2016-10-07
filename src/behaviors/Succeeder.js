import { BEHAVIOR_TYPE } from '../const'

const behavior = {
	name: 'Succeeder',
	type: BEHAVIOR_TYPE.LEAF,
	description: 'This action node returns SUCCESS always.',
}

const compilation = {
	tick({ status }) {
		return status.SUCCESS
	},
}

export default { behavior, compilation }
