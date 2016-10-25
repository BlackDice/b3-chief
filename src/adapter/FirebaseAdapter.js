import { init } from 'stampit'
import invariant from 'invariant'
import { oneLine } from 'common-tags'

const FirebaseAdapter = init(initializeFirebaseAdapter).methods({ sync })

function initializeFirebaseAdapter({ chief, firebaseRef }) {
	invariant(firebaseRef, oneLine`
		'The Firebase adapter is expecting firebaseRef specified in options object.'
	`)

	this.chief = chief
	this.firebaseRef = firebaseRef
}

const syncedInstances = new WeakSet()

function sync(watchRemote = false) {
	invariant(syncedInstances.has(this.chief) === false, oneLine`
		The Chief %s is already synced with firebase %s
	`, this.chief.id, this.firebaseRef.toString())

	syncedInstances.add(this.chief)

	const { selectors, observe } = this.chief.store

	const updateState = (snapshot) => {
		const state = snapshot.val()
		if (state !== null) {
			this.chief.replaceState(state)
		}
	}

	const syncPromise = this.firebaseRef.once('value').then(updateState)

	const behaviorsRef = this.firebaseRef.child('behaviors')
	const treesRef = this.firebaseRef.child('trees')
	const subjectsRef = this.firebaseRef.child('subjects')

	if (watchRemote === true) {
		behaviorsRef.on('value', (snapshot) => this.chief.store.actions.replaceBehaviors(snapshot.val()))
		treesRef.on('value', (snapshot) => this.chief.store.actions.replaceTrees(snapshot.val()))
		return syncPromise.then(() => this.chief)
	}

	return syncPromise.then(() => {
		observe(selectors.behaviors, (behaviors) => {
			behaviorsRef.set(behaviors)
		})

		observe(selectors.trees, (trees) => {
			treesRef.set(trees)
		})

		observe(selectors.subjects, (subjects) => {
			subjectsRef.set(subjects)
		})

		return this.chief
	})
}

export default FirebaseAdapter
