import t from 'tcomb'

export const TickLeaf = t.interface({}, {
	name: 'ExecutionTickLeaf',
	strict: true,
})

export const TickDecorator = t.interface({
	child: t.Function,
}, {
	name: 'ExecutionTickDecorator',
	strict: true,
})

export const TickComposite = TickLeaf.extend({
	children: t.list(t.Function),
}, {
	name: 'ExecutionTickComposite',
	strict: true,
})

export const TickSubtree = TickLeaf.extend({
	executeTree: t.Function,
}, {
	name: 'ExecutionTickSubtree',
	strict: true,
})

export default t.union([TickLeaf, TickDecorator, TickComposite, TickSubtree], 'Tick')
