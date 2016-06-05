import stampit from 'stampit';

const Private = stampit()
	.init((options, { instance }) => {
		instance.map = new WeakMap();
	})
	.methods({
		init(owner) {
			const ownerMap = new Map();
			this.map.set(owner, ownerMap);
			return ownerMap;
		},
		for(owner) {
			return this.map.get(owner);
		},
		get(owner, key) {
			const ownerMap = this.for(owner);
			return ownerMap.has(key) ? ownerMap.get(key) : null;
		},
		set(owner, key, value) {
			this.for(owner).set(key, value);
			return value;
		},
	})
;

export default Private;
