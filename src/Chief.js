import stampit from 'stampit';

import TreeList from './TreeList';
import SubjectList from './SubjectList';

const Chief = stampit.compose(
	TreeList, SubjectList
);

export default Chief;
