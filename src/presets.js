import { SHOW_ELEMENTS } from './actions.js'

export default function UpdatePresetDefinitions(self) {
	const presets = {}

	for (const el of SHOW_ELEMENTS) {
		presets[`show_${el.id}`] = {
			type: 'button',
			category: 'Show/hide',
			name: `Show ${el.label}`,
			style: { text: `SHOW\\n${el.label}`, size: 'auto', color: 0xffffff, bgcolor: 0x000000 },
			steps: [{ down: [{ actionId: 'set_visibility', options: { element: el.id, on: 'true' } }], up: [] }],
			feedbacks: [],
		}
		presets[`hide_${el.id}`] = {
			type: 'button',
			category: 'Show/hide',
			name: `Hide ${el.label}`,
			style: { text: `HIDE\\n${el.label}`, size: 'auto', color: 0xffffff, bgcolor: 0x000000 },
			steps: [{ down: [{ actionId: 'set_visibility', options: { element: el.id, on: 'false' } }], up: [] }],
			feedbacks: [],
		}
	}

	for (const [op, label] of [['start', 'Start'], ['pause', 'Pause'], ['reset', 'Reset']]) {
		presets[`timer_${op}`] = {
			type: 'button',
			category: 'Show/hide',
			name: `Timer ${label}`,
			style: { text: `TIMER\\n${label}`, size: 'auto', color: 0xffffff, bgcolor: 0x000000 },
			steps: [{ down: [{ actionId: 'timer_control', options: { op } }], up: [] }],
			feedbacks: [],
		}
	}

	for (const s of self.library) {
		presets[`read_${s.id}`] = {
			type: 'button',
			category: 'Reads',
			name: s.name,
			style: {
				text: s.name,
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			steps: [
				{
					down: [{ actionId: 'trigger_read_named', options: { name: s.name } }],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'read_is_live',
					options: { name: s.name },
					style: { bgcolor: 0x00aa00, color: 0xffffff },
				},
			],
		}
	}

	self.setPresetDefinitions(presets)
}
