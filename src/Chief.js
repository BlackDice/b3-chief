import { compose } from 'stampit'

import BehaviorList from './BehaviorList'
import SubjectList from './SubjectList'
import TreeList from './TreeList'
import Execution from './Execution'
import Uid from './core/Uid'

import * as constants from './const'

import adapter from './adapter'

const Chief = compose(
	BehaviorList, SubjectList, TreeList, Execution, Uid, {
		init: initializeChief,
		statics: { ...constants, adapter },
	}
)

function initializeChief() {
	Reflect.defineProperty(this, 'id', { value: this.createUid() })
}

export default Chief
