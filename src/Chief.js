import stampit from 'stampit';

import TreeList from './TreeList';
import SubjectList from './SubjectList';
import Runner from './Runner';
import Uid from './core/Uid';

import adapter from './adapter';

const Chief = stampit
	.compose(
		TreeList, SubjectList, Runner, Uid
	)
	.statics({ adapter })
	.init(function initializeChief() {
		Reflect.defineProperty(this, 'id', { value: this.createUid() });
	})
;

export default Chief;
