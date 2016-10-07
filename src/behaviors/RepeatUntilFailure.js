import { oneLine } from 'common-tags'
import { BEHAVIOR_TYPE } from '../const'

const initialLoop = 0
const minimumMaxLoop = 1

const behavior = {
	name: 'RepeatUntilFailure',
	type: BEHAVIOR_TYPE.DECORATOR,
	description: oneLine`
		RepeatUntilFailure is a decorator that repeats the tick signal until the
		node child returns FAILURE, RUNNING or ERROR. Optionally, a maximum
		number of repetitions can be defined.
	`,
	config: {
		maxLoop: false,
	},
}

const compilation = {
	onValidate({ config }) {
		const { maxLoop } = config
		if (maxLoop === false) {
			return
		}
		if (Number.isInteger(maxLoop) === false) {
			throw new Error(`RepeatUntilFailure.maxLoop is not a valid number, got: ${maxLoop}`)
		}
		if (maxLoop < minimumMaxLoop) {
			throw new Error(
				`RepeatUntilFailure.maxLoop must be at least ${minimumMaxLoop}, got: ${maxLoop}`
			)
		}
	},
	onOpen({ memory }) {
		memory.set('currentLoop', initialLoop)
	},
	tick({ status, memory, config }, { child }) {
		const { maxLoop } = config

		let currentLoop = memory.get('currentLoop')
		let resultStatus = status.ERROR

		while (maxLoop < 0 || currentLoop < maxLoop) {
			resultStatus = child()
			if (resultStatus === status.SUCCESS) {
				currentLoop += 1
			} else {
				break
			}
		}

		memory.set('currentLoop', currentLoop)
		return status
	},
}

export default { behavior, compilation }
