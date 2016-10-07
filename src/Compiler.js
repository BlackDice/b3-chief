import { init } from 'stampit'

const Compiler = init(initializeCompiler)

const defaultTranspiler = (code) => code

function initializeCompiler({ transpiler = defaultTranspiler }) {
	this.compiler = getVMCompiler(transpiler) || getEvalCompiler(transpiler)
}

function getVMCompiler(transpiler) {
	try {
		const vm = require('vm') // eslint-disable-line
		const sandbox = {}
		vm.createContext(sandbox)
		return (code) => vm.runInContext(transpiler(code), sandbox)
	} catch (err) {
		return null
	}
}

function getEvalCompiler(transpiler) {
	const evaluate = eval // eslint-disable-line no-eval
	return (code) => evaluate(transpiler(code))
}

export default Compiler
