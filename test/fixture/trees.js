export default () => ({
	trees: {
		EmptyTree: {
			id: 'EmptyTree',
			name: 'Empty tree',
			nodes: {},
		},
		RootOnly: {
			id: 'RootOnly',
			name: 'Tree with root',
			nodes: {
				TestRoot: {
					id: 'TestRoot',
					behaviorId: 'Native-Sequence',
					parentId: 'RootOnly',
				},
			},
		},
		TestTree: {
			id: 'TestTree',
			name: 'Test tree',
			description: 'Description of test tree',
			nodes: {
				TestRoot: {
					id: 'TestRoot',
					behaviorId: 'Native-Sequence',
					parentId: 'TestTree',
					childIndex: 0,
				},
				TestFirstChild: {
					id: 'TestFirstChild',
					behaviorId: 'Native-Runner',
					parentId: 'TestRoot',
					childIndex: 0,
				},
				TestSecondChild: {
					id: 'TestSecondChild',
					behaviorId: 'Native-Failer',
					parentId: 'TestRoot',
					childIndex: 1,
				},
			},
		},
	},
})
