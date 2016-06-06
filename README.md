# Behavior3 Chief

_Manage and run behavior trees for your subjects in your game_

[![npm](https://img.shields.io/npm/v/behavior3-chief.svg?maxAge=2592000)]()
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/BlackDice/b3-chief/master/LICENSE.txt)
[![Travis](https://img.shields.io/travis/BlackDice/b3-chief.svg?maxAge=2592000)]()
[![Coverage Status](https://coveralls.io/repos/github/BlackDice/b3-chief/badge.svg?branch=master)](https://coveralls.io/github/BlackDice/b3-chief?branch=master)
[![David](https://img.shields.io/david/BlackDice/b3-chief.svg?maxAge=2592000)]()

Chief is a simple wrapper around JavaScript library [Behavior3](http://behavior3.com/). Main reason for its creation is to have a unified place for managing behavior trees, nodes and subjects.

> A behaviour tree is a tree of hierarchical nodes that control the flow of decision making of an AI entity. At the extents of the tree, the leaves, are the actual commands that control the AI entity, and forming the branches are various types of utility nodes that control the AI’s walk down the trees to reach the sequences of commands best suited to the situation.
 
_Quoted from [the article](http://www.gamasutra.com/blogs/ChrisSimpson/20140717/221339/Behavior_trees_for_AI_How_they_work.php)_

Subject is an _invention_ of the Chief. It represents a single entity that runs a single behavior tree. Its memory and status can be easily accessed. This helps to build better development tools or even to watch tree running in a real game.

## Installation ##

```bash
	npm install -S behavior3-chief
```

## Usage ##

Chief exports single factory function to create instance of its API object.

```js
	import Chief from 'behavior3-chief';
	const chief = Chief.create();
```

### Behavior nodes

Chief registers known built in nodes when created. Any custom nodes has to be registered with `registerBehaviorNode` method which accepts [node descriptor](#node-descriptor). Specifying globally unique name for nodes is obligatory as such name is used when constructing new node instances.

To see list of currently registered behavior nodes, use `listBehaviorNodes` method which returns simple collection like following:

```js
	[
		{ name: 'Failer', category: 'action', parameters: null },
		{ name: 'MaxTime', category: 'decorator', parameters: { maxTime: 0 }}
	]
```

### 

### <a name="node-descriptor"></a>Node descriptor ###

## Fully pluggable (_composable_)

Chief is built using [stamps](https://github.com/stampit-org/stamp-specification). That makes it pluggable almost by default. Exported stamp of Chief can be easily composed further before creating its instance.

```js
	import Chief from 'b3-chief';
	const BetterChief = Chief.methods({
		findSubjectByName(name) {
			return this.listSubjects().find((subject) => subject.getName());
		}
	})

	const chief = BetterChief.create();
	chief.findSubjectByName('Master');
```

This gives you amazing flexibility in everything. You can easily add various methods and properties there instead for your own use or perhaps create plugin library that just exports the stamp to be composed there.
