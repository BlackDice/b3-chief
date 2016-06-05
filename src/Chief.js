import stampit from 'stampit';

import TreeList from './TreeList';
import SubjectList from './SubjectList';
import Runner from './Runner';

const Chief = stampit.compose(
	TreeList, SubjectList, Runner
);

export default Chief;
