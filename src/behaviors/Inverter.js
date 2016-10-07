import { oneLine } from 'common-tags'
import { BEHAVIOR_TYPE } from '../const'

const behavior = {
	name: 'Inverter',
	type: BEHAVIOR_TYPE.DECORATOR,
	description: oneLine`
		The Inverter decorator inverts the result of the child, returning SUCCESS
		for FAILURE and FAILURE for SUCCESS.
	`,
}

const compilation = {
	tick({ status }, { child }) {
		const resultStatus = child()

		if (resultStatus === status.SUCCESS) {
			return status.FAILURE
		} else if (resultStatus === status.FAILURE) {
			return status.SUCCESS
		}

		return resultStatus
	},
}

export default { behavior, compilation }
