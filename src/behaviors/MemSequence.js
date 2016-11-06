import { oneLine } from 'common-tags'
import { BEHAVIOR_TYPE } from '../const'

const initialChildIndex = 0

const behavior = {
	name: 'MemSequence',
	type: BEHAVIOR_TYPE.COMPOSITE,
	description: oneLine`
		MemSequence is similar to Sequence node, but when a child returns a
		RUNNING state, its index is recorded and in the next tick the
		MemSequence call the child recorded directly, without calling previous
		children again.
	`,
}

const compilation = {
	onOpen({ memory }) {
		memory.set('runningChild', initialChildIndex)
	},
	tick({ status, memory }, { children }) {
		const childrenCount = children.length

		let childIndex = memory.get('runningChild') || initialChildIndex

		while (childIndex < childrenCount) {
			const child = children[childIndex]
			const childStatus = child()

			if (childStatus !== status.SUCCESS) {
				if (childStatus === status.RUNNING) {
					memory.set('runningChild', childIndex)
				}
				return childStatus
			}

			childIndex += 1 // eslint-disable-line no-magic-numbers
		}

		return status.SUCCESS
	},
}

export default { behavior, compilation }
