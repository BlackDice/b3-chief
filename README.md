# Behavior3 Chief

_Manage and run behavior trees for your subjects in your game_

[![npm](https://img.shields.io/npm/v/behavior3-chief.svg?maxAge=2592000)]()
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/BlackDice/b3-chief/master/LICENSE.txt)
[![Travis](https://img.shields.io/travis/BlackDice/b3-chief.svg?maxAge=2592000)]()
[![Coverage Status](https://coveralls.io/repos/github/BlackDice/b3-chief/badge.svg?branch=master)](https://coveralls.io/github/BlackDice/b3-chief?branch=master)
[![David](https://img.shields.io/david/BlackDice/b3-chief.svg?maxAge=2592000)]()

Chief is full features JavaScript library for creating, maintaining and executing behavior trees.

> A behaviour tree is a tree of hierarchical nodes that control the flow of decision making of an AI entity. At the extents of the tree, the leaves, are the actual commands that control the AI entity, and forming the branches are various types of utility nodes that control the AI’s walk down the trees to reach the sequences of commands best suited to the situation.
 
_Quoted from [the article](http://www.gamasutra.com/blogs/ChrisSimpson/20140717/221339/Behavior_trees_for_AI_How_they_work.php)_

Subject is an _invention_ of the Chief. It represents a single entity that runs a single behavior tree. It has memory for sharing data between other nodes and trees.

## Features ##



## Installation ##

```bash
	npm install -S behavior3-chief
```

## Usage ##

Chief exports single factory function to create instance of its API object.

```js
	import Chief from 'behavior3-chief'
	const chief = Chief.create()
```

### Behaviors

Behavior is used contain actual logic behind tree execution. Chief contains several native behaviors. New behaviors can be added easily.

#### Using EcmaScript2015+

Generally there is no limitation to write definition of behaviors using ES2015 (or later) specification of JavaScript language. Actually it's recommended as it was designed that way (eg. destructuring feature).

Since behavior defininitions are compiled on the fly, you need to either make sure that target environment can run such code or you can supply transpiler to Chief. Including Babel is surely overkill, luckily there is a very promising project called [Bublé](https://buble.surge.sh/).

```js
	import { transform } from 'buble'
	const chief = Chief.create({
		transpiler(code) {
			return transform(code).code
		}
	})
```
