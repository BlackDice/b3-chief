import { oneLine } from 'common-tags'
import { BEHAVIOR_TYPE } from '../const'

const behavior = {
	name: 'Sequence',
	type: BEHAVIOR_TYPE.COMPOSITE,
	description: oneLine`
		The Sequence node ticks its children sequentially until one of them
		returns FAILURE, RUNNING or ERROR. If all children return the
		success state, the sequence also returns SUCCESS.
	`,
}

const compilation = {
	tick({ status }, { children }) {
		for (let i = 0, len = children.length; i < len; i += 1) {
			const childStatus = children[i]()
			if (childStatus !== status.SUCCESS) {
				return childStatus
			}
		}

		return status.SUCCESS
	},
}

export default { behavior, compilation }
