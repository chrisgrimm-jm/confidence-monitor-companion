import { set, push, serverTimestamp } from '@firebase/database'
import { promptRef } from './firebase.js'

// element id (used in action/feedback options + preset ids) -> Confidence Monitor's state key
export const SHOW_ELEMENTS = [
	{ id: 'prompter', label: 'Teleprompter', key: 'promptShow' },
	{ id: 'producer', label: 'Producer note', key: 'prodShow' },
	{ id: 'timer', label: 'Timer', key: 'timerShow' },
	{ id: 'clock', label: 'Clock', key: 'clockShow' },
]

export default function UpdateActions(self) {
	const choices = self.library.length
		? self.library.map((s) => ({ id: s.name, label: s.name }))
		: [{ id: '', label: '(script library not loaded yet)' }]

	// n must be a server timestamp, not a fixed value — Confidence Monitor only reacts when it
	// strictly increases, so pressing the same button twice in a row still fires the second time.
	async function triggerByName(name) {
		if (!name) return
		await set(promptRef(self.config.topic, 'trigger'), { name, n: serverTimestamp() })
	}
	// show/hide/timer commands go through a real queue (push a new child, Confidence Monitor
	// applies and removes each one) rather than one shared value -- two commands for different
	// elements landing close together must both land, not have the later one silently win.
	async function setVisible(elementId, on) {
		const el = SHOW_ELEMENTS.find((e) => e.id === elementId)
		if (!el) return
		await push(promptRef(self.config.topic, 'uiq'), { t: 'show', key: el.key, on })
	}
	async function toggleVisible(elementId) {
		const el = SHOW_ELEMENTS.find((e) => e.id === elementId)
		if (!el) return
		await push(promptRef(self.config.topic, 'uiq'), { t: 'toggle', key: el.key })
	}
	async function timerOp(op) {
		await push(promptRef(self.config.topic, 'uiq'), { t: 'timer', op })
	}

	self.setActionDefinitions({
		trigger_read: {
			name: 'Trigger read (pick from library)',
			options: [
				{
					id: 'name',
					type: 'dropdown',
					label: 'Read',
					choices,
					default: choices[0].id,
				},
			],
			callback: async (event) => triggerByName(event.options.name),
		},
		trigger_read_named: {
			name: 'Trigger read (type exact name)',
			options: [
				{
					id: 'name',
					type: 'textinput',
					label: 'Exact read name',
					default: '',
				},
			],
			callback: async (event) => triggerByName(event.options.name),
		},
		set_visibility: {
			name: 'Show/hide an overlay element',
			options: [
				{
					id: 'element',
					type: 'dropdown',
					label: 'Element',
					choices: SHOW_ELEMENTS.map((e) => ({ id: e.id, label: e.label })),
					default: SHOW_ELEMENTS[0].id,
				},
				{
					id: 'on',
					type: 'dropdown',
					label: 'State',
					choices: [
						{ id: 'true', label: 'Show' },
						{ id: 'false', label: 'Hide' },
					],
					default: 'true',
				},
			],
			callback: async (event) => setVisible(event.options.element, event.options.on === 'true'),
		},
		toggle_visibility: {
			name: 'Toggle an overlay element',
			options: [
				{
					id: 'element',
					type: 'dropdown',
					label: 'Element',
					choices: SHOW_ELEMENTS.map((e) => ({ id: e.id, label: e.label })),
					default: SHOW_ELEMENTS[0].id,
				},
			],
			callback: async (event) => toggleVisible(event.options.element),
		},
		timer_control: {
			name: 'Timer start/pause/reset',
			options: [
				{
					id: 'op',
					type: 'dropdown',
					label: 'Action',
					choices: [
						{ id: 'start', label: 'Start' },
						{ id: 'pause', label: 'Pause' },
						{ id: 'reset', label: 'Reset' },
					],
					default: 'start',
				},
			],
			callback: async (event) => timerOp(event.options.op),
		},
	})
}
