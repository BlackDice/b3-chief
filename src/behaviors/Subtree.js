import { BEHAVIOR_TYPE } from '../const'

const behavior = {
	name: 'Subtree',
	type: BEHAVIOR_TYPE.SUBTREE,
	description: 'Executes another tree as a part of current tree and returns its output status.',
	config: {
		treeId: null,
	},
}

const compilation = {
	tick({ config }, { executeTree }) {
		const { treeId } = config
		return executeTree(treeId)
	},
}

export default { behavior, compilation }
