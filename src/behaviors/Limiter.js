import { oneLine } from 'common-tags'
import { BEHAVIOR_TYPE } from '../const'

const initialLoop = 0
const minimumMaxLoop = 1

const behavior = {
	name: 'Limiter',
	type: BEHAVIOR_TYPE.DECORATOR,
	description: oneLine`
		This decorator limit the number of times its child can be called. After a
		certain number of times, the Limiter decorator returns FAILURE without
		executing the child.
	`,
	config: {
		maxLoop: 1,
	},
}

const compilation = {
	onValidate({ config }) {
		const { maxLoop } = config
		if (Number.isInteger(maxLoop) === false) {
			throw new Error(`Limiter.maxLoop is not a valid number, got: ${maxLoop}`)
		}
		if (maxLoop < minimumMaxLoop) {
			throw new Error(
				`Limiter.maxLoop must be at least ${minimumMaxLoop}, got: ${maxLoop}`,
			)
		}
	},
	onOpen({ memory }) {
		memory.set('currentLoop', initialLoop)
	},
	tick({ status, config, memory }, { child }) {
		const { maxLoop } = config
		const currentLoop = memory.get('currentLoop')

		if (currentLoop < maxLoop) {
			const resultStatus = child()

			if (resultStatus === status.SUCCESS || resultStatus === status.FAILURE) {
				memory.set('currentLoop', currentLoop + 1) // eslint-disable-line no-magic-numbers
			}

			return resultStatus
		}

		return status.FAILURE
	},
}

export default { behavior, compilation }
