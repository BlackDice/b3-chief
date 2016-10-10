import { init } from 'stampit'
import debug from 'debug'

const Compiler = init(initializeCompiler)

const log = debug('chief:compiler')

const defaultTranspiler = (code) => code

function initializeCompiler({ transpiler = defaultTranspiler, onError = log }) {
	this.compiler = getVMCompiler(transpiler, onError) || getEvalCompiler(transpiler, onError)
}

function getVMCompiler(transpiler, onError) {
	const vm = getVM()
	if (vm === null) {
		return null
	}

	const sandbox = {}
	vm.createContext(sandbox)

	function compile(code) {
		try {
			return vm.runInContext(transpiler(code), sandbox)
		} catch (err) {
			onError(err)
			return null
		}
	}

	return compile
}

function getVM() {
	try {
		return require('vm') // eslint-disable-line
	} catch (err) {
		return null
	}
}

function getEvalCompiler(transpiler, onError) {
	const evaluate = eval // eslint-disable-line no-eval

	function compile(code) {
		try {
			return evaluate(transpiler(code))
		} catch (err) {
			onError(err)
			return null
		}
	}

	return compile
}

export default Compiler
