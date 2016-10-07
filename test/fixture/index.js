import behaviorsFixture from './behaviors'
import subjectsFixture from './subjects'
import treesFixture from './trees'

export default function fixture() {
	return {
		...behaviorsFixture(),
		...subjectsFixture(),
		...treesFixture(),
	}
}

export { behaviorsFixture, subjectsFixture, treesFixture }
