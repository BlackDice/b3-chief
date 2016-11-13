import { BEHAVIOR_TYPE } from '../const'

const minimumWait = 0

const behavior = {
	name: 'Wait',
	type: BEHAVIOR_TYPE.LEAF,
	description: 'Wait some time in milliseconds.',
	config: {
		milliseconds: 0,
	},
}

const compilation = {
	onValidate({ config }) {
		const { milliseconds } = config
		if (Number.isInteger(milliseconds) === false) {
			throw new Error(`Wait.milliseconds is not a valid number, got: ${milliseconds}`)
		}
		if (milliseconds < minimumWait) {
			throw new Error(
				`Wait.milliseconds must be at least ${minimumWait}, got: ${milliseconds}`,
			)
		}
	},
	onOpen({ memory, timestamp }) {
		memory.set('startTime', timestamp())
	},
	tick({ status, timestamp, memory, config }) {
		const { milliseconds } = config
		const startTime = memory.get('startTime')

		if (timestamp() - startTime > milliseconds) {
			return status.SUCCESS
		}

		return status.RUNNING
	},
}

export default { behavior, compilation }
