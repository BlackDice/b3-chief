import stampit from 'stampit';

import Logger from './core/Logger';

import SubjectList from './SubjectList';
import TreeList from './TreeList';

const Runner = stampit({
	methods: { tick },
}).compose(SubjectList, TreeList, Logger);

function tick() {
	for (const subject of this.listSubjects()) {
		const tree = this.getTree(subject.getTreeId());
		this.debug('tick', '%s ticks %s', tree, subject);
		tree.tick(subject);
	}
}

export default Runner;
