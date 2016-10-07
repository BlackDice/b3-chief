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

function sync() {
	invariant(syncedInstances.has(this.chief) === false, oneLine`
		The Chief %s is already synced with firebase %s
	`, this.chief.id, this.firebaseRef.toString())

	syncedInstances.add(this.chief)

	const { selectors, observe } = this.chief.store

	return this.firebaseRef.once('value').then((snapshot) => {
		const state = snapshot.val()
		if (state !== null) {
			this.chief.replaceState(state)
		}

		observe(selectors.behaviors, (behaviors) => {
			this.firebaseRef.child('behaviors').set(behaviors)
		})

		observe(selectors.trees, (trees) => {
			this.firebaseRef.child('trees').set(trees)
		})

		observe(selectors.subjects, (subjects) => {
			this.firebaseRef.child('subjects').set(subjects)
		})

		return this.chief
	})
}

export default FirebaseAdapter
