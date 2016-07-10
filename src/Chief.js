import stampit from 'stampit';

import TreeList from './TreeList';
import SubjectList from './SubjectList';
import Runner from './Runner';

import adapter from './adapter';

const Chief = stampit.compose(
	TreeList, SubjectList, Runner
).statics({ adapter });

export default Chief;
