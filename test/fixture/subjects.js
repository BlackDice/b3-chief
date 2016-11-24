export default () => ({
	subjects: {
		TestAlphaSubject: {
			id: 'TestAlphaSubject',
			treeId: 'EmptyTree',
			target: 'AlphaTarget',
		},
		TestBetaSubject: {
			id: 'TestBetaSubject',
			treeId: 'EmptyTree',
			target: 'BetaTarget',
			memories: {
				TestBetaSubject: {
					number: 10,
					string: 'foo',
					boolean: true,
					array: [20, 'bar', false],
					object: {
						key: 'value',
					},
				},
			},
		},
		TestGamaSubject: {
			id: 'TestGamaSubject',
			treeId: 'EmptyTree',
			target: 'GamaTarget',
		},
	},
})
