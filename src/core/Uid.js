import stampit from 'stampit';
import uid from 'uid';

const defaultUidLength = 12;

const Uid = stampit.methods({
	createUid(length = defaultUidLength) {
		return uid(length);
	},
});

export default Uid;
