import { oneLine } from 'common-tags'
import { BEHAVIOR_TYPE } from '../const'

const minimumMaxTime = 0

const behavior = {
	name: 'MaxTime',
	type: BEHAVIOR_TYPE.DECORATOR,
	description: oneLine`
		The MaxTime decorator limits the maximum time the node child can execute.
		Notice that it does not interrupt the execution itself (i.e., the child
		must be non-preemptive), it only interrupts the node after a RUNNING
		status.
	`,
	config: {
		maxTime: 0,
	},
}

const compilation = {
	onValidate({ config }) {
		const { maxTime } = config
		if (Number.isInteger(maxTime) === false) {
			throw new Error(`MaxTime.maxTime is not a valid number, got: ${maxTime}`)
		}
		if (maxTime < minimumMaxTime) {
			throw new Error(
				`MaxTime.maxTime must be at least ${minimumMaxTime}, got: ${maxTime}`,
			)
		}
	},
	onOpen({ memory, timestamp }) {
		memory.set('startTime', timestamp())
	},
	tick({ status, timestamp, memory, config }, { child }) {
		const { maxTime } = config
		const startTime = memory.get('startTime')

		const resultStatus = child()

		if (timestamp() - startTime > maxTime) {
			return status.FAILURE
		}

		return resultStatus
	},
}

export default { behavior, compilation }
