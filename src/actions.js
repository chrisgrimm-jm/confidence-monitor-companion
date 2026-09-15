import { set, serverTimestamp } from 'firebase/database'
import { promptRef } from './firebase.js'

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
	})
}
