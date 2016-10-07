import { oneLine } from 'common-tags'
import { BEHAVIOR_TYPE } from '../const'

const initialChildIndex = 0

const behavior = {
	name: 'MemPriority',
	type: BEHAVIOR_TYPE.COMPOSITE,
	description: oneLine`
		MemPriority is similar to Priority node, but when a child returns a
		RUNNING state, its index is recorded and in the next tick the,
		MemPriority calls the child recorded directly, without calling previous
		children again.
	`,
}

const compilation = {
	onOpen({ subjectMemory }) {
		subjectMemory.set('runningChild', initialChildIndex)
	},
	tick({ status, memory }, { children }) {
		const childrenCount = children.length

		let childIndex = memory.get('runningChild') || initialChildIndex

		while (childIndex < childrenCount) {
			const child = children[childIndex]
			const childStatus = child()

			if (childStatus !== status.FAILURE) {
				if (childStatus === status.RUNNING) {
					memory.set('runningChild', childIndex)
				}
				return childStatus
			}

			childIndex += 1 // eslint-disable-line no-magic-numbers
		}

		return status.FAILURE
	},
}

export default { behavior, compilation }
