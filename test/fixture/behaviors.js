import { stripIndent } from 'common-tags'

export default () => ({
	behaviors: {
		LeafBehavior: {
			id: 'LeafBehavior',
			name: 'Leaf behavior',
			description: 'Always successful',
			type: 'LEAF',
			definition: stripIndent`{
				tick({ status }) {
					return status.SUCCESS
				},
			}`,
		},
		CompositeBehavior: {
			id: 'CompositeBehavior',
			name: 'Composite behavior',
			description: 'All children must be successful',
			type: 'COMPOSITE',
			definition: stripIndent`{
				tick({ status }, { children }) {
					for (const child of children) {
						if (child() !== status.SUCCESS) {
							return status.FAILURE
						}
					}
					return status.SUCCESS
				},
			}`,
		},
		DecoratorBehavior: {
			id: 'DecoratorBehavior',
			name: 'Decorator behavior',
			description: 'Child must be successful',
			type: 'DECORATOR',
			definition: stripIndent`{
				tick({ status }, { child }) {
					return (child() === status.SUCCESS
						? status.SUCCESS
						: status.FAILURE
					)
				},
			}`,
		},
	},
})
