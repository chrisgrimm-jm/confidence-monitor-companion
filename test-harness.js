// Scratch test harness -- NOT part of the shipped module. Exercises the module's logic
// pieces directly (Companion's own host process drives the real InstanceBase lifecycle, which
// isn't practical to fully simulate here) against the real Firebase project.
import { get } from '@firebase/database'
import { promptRef } from './src/firebase.js'
import UpdateActions from './src/actions.js'
import UpdateFeedbacks from './src/feedbacks.js'
import UpdateVariableDefinitions from './src/variables.js'
import UpdatePresetDefinitions from './src/presets.js'
import ModuleInstance, { UpgradeScripts } from './src/main.js'

function makeSelf() {
	return {
		config: { topic: 'adread' },
		library: [],
		liveName: '',
		setActionDefinitions(defs) {
			this._actions = defs
		},
		setFeedbackDefinitions(defs) {
			this._feedbacks = defs
		},
		setVariableDefinitions(defs) {
			this._varDefs = defs
		},
		setVariableValues(vals) {
			this._varVals = { ...(this._varVals || {}), ...vals }
		},
		// two args as of @companion-module/base 2.1.3: (structure, presets) -- matching this
		// shape here is the whole point of the stub; a single-arg call is exactly the bug that
		// shipped in 0.2.0 ("cannot convert undefined or null to object" on Companion's side).
		setPresetDefinitions(structure, presets) {
			if (presets === undefined) throw new Error('setPresetDefinitions called with only one argument (structure, presets both required)')
			this._presetStructure = structure
			this._presets = presets
		},
	}
}

async function main() {
	console.log('--- confirming main.js exports the class as default + UpgradeScripts named ---')
	console.log('default export is a class extending InstanceBase-like shape:', typeof ModuleInstance, ModuleInstance.name)
	console.log('UpgradeScripts export:', UpgradeScripts)

	console.log('--- reading real library from Firebase ---')
	const snap = await get(promptRef('adread', 'scripts'))
	const v = snap.val() || {}
	const library = Object.keys(v).map((k) => ({ id: k, name: v[k].name || 'Untitled' }))
	console.log('library:', library)

	console.log('--- reading real content (currently live) ---')
	const csnap = await get(promptRef('adread', 'content'))
	const cv = csnap.val() || {}
	console.log('live name:', cv.name)

	console.log('--- exercising actions.js with empty library ---')
	let self = makeSelf()
	UpdateActions(self)
	console.log('action ids:', Object.keys(self._actions))
	console.log('trigger_read choices (empty lib):', self._actions.trigger_read.options[0].choices)

	console.log('--- exercising actions.js/feedbacks.js/variables.js with real library ---')
	self = makeSelf()
	self.library = library
	self.liveName = cv.name || ''
	UpdateActions(self)
	UpdateFeedbacks(self)
	UpdateVariableDefinitions(self)
	UpdatePresetDefinitions(self)
	console.log('trigger_read choices (real lib):', self._actions.trigger_read.options[0].choices)
	console.log('feedback ids:', Object.keys(self._feedbacks))
	console.log('preset ids:', Object.keys(self._presets))
	console.log('preset structure:', JSON.stringify(self._presetStructure))
	console.log(
		'read_is_live callback true for live name:',
		self._feedbacks.read_is_live.callback({ options: { name: cv.name } }),
	)
	console.log(
		'read_is_live callback false for bogus name:',
		self._feedbacks.read_is_live.callback({ options: { name: 'zzz-nope-zzz' } }),
	)
	console.log('variable defs:', self._varDefs)
	console.log('variable values:', self._varVals)

	if (process.env.RUN_LIVE_TRIGGER) {
		console.log('--- RUN_LIVE_TRIGGER set: firing the trigger action for the first library entry ---')
		if (library.length) {
			await self._actions.trigger_read.callback({ options: { name: library[0].name } })
			console.log('triggered:', library[0].name)
		}
	} else {
		console.log('--- skipping the live trigger (this hits the real production Firebase project and')
		console.log('    would actually change what\'s on the prompter) -- set RUN_LIVE_TRIGGER=1 to run it')
	}

	process.exit(0)
}

main().catch((err) => {
	console.error('TEST FAILED:', err)
	process.exit(1)
})
