import { oneLine } from 'common-tags'
import { BEHAVIOR_TYPE } from '../const'

const initialLoop = 0
const minimumMaxLoop = 1

const behavior = {
	name: 'Repeater',
	type: BEHAVIOR_TYPE.DECORATOR,
	description: oneLine`
		Repeater is a decorator that repeats execution of its child until that child
		return RUNNING or ERROR. Optionally, a maximum number of repetitions
		can be defined.
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
			throw new Error(`Repeater.maxLoop is not a valid number, got: ${maxLoop}`)
		}
		if (maxLoop < minimumMaxLoop) {
			throw new Error(
				`Repeater.maxLoop must be at least ${minimumMaxLoop}, got: ${maxLoop}`,
			)
		}
	},
	onOpen({ memory }) {
		memory.set('currentLoop', initialLoop)
	},
	tick({ status, memory, config }, { child }) {
		const { maxLoop } = config

		let currentLoop = memory.get('currentLoop')
		let resultStatus = status.SUCCESS

		while (maxLoop < 0 || currentLoop < maxLoop) {
			resultStatus = child()
			if (resultStatus === status.SUCCESS || resultStatus === status.FAILURE) {
				currentLoop += 1
			} else {
				break
			}
		}

		memory.set('currentLoop', currentLoop)
		return resultStatus
	},
}

export default { behavior, compilation }
