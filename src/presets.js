import { SHOW_ELEMENTS } from './actions.js'

// setPresetDefinitions(structure, presets) -- two arguments as of @companion-module/base 2.1.3.
// `structure` groups preset ids into named sections for the UI; `presets` is the flat id -> definition
// map. Passing only one argument (the old single-object API) leaves `presets` undefined on the host
// side and Companion throws "cannot convert undefined or null to object" trying to process it.
export default function UpdatePresetDefinitions(self) {
	const presets = {}
	const readIds = []
	const controlIds = []

	for (const el of SHOW_ELEMENTS) {
		presets[`show_${el.id}`] = {
			type: 'simple',
			name: `Show ${el.label}`,
			style: { text: `SHOW\\n${el.label}`, size: 'auto', color: 0xffffff, bgcolor: 0x000000 },
			steps: [{ down: [{ actionId: 'set_visibility', options: { element: el.id, on: 'true' } }], up: [] }],
			feedbacks: [],
		}
		presets[`hide_${el.id}`] = {
			type: 'simple',
			name: `Hide ${el.label}`,
			style: { text: `HIDE\\n${el.label}`, size: 'auto', color: 0xffffff, bgcolor: 0x000000 },
			steps: [{ down: [{ actionId: 'set_visibility', options: { element: el.id, on: 'false' } }], up: [] }],
			feedbacks: [],
		}
		presets[`toggle_${el.id}`] = {
			type: 'simple',
			name: `Toggle ${el.label}`,
			style: { text: `TOGGLE\\n${el.label}`, size: 'auto', color: 0xffffff, bgcolor: 0x000000 },
			steps: [{ down: [{ actionId: 'toggle_visibility', options: { element: el.id } }], up: [] }],
			feedbacks: [],
		}
		controlIds.push(`show_${el.id}`, `hide_${el.id}`, `toggle_${el.id}`)
	}

	for (const [op, label] of [
		['start', 'Start'],
		['pause', 'Pause'],
		['reset', 'Reset'],
	]) {
		presets[`timer_${op}`] = {
			type: 'simple',
			name: `Timer ${label}`,
			style: { text: `TIMER\\n${label}`, size: 'auto', color: 0xffffff, bgcolor: 0x000000 },
			steps: [{ down: [{ actionId: 'timer_control', options: { op } }], up: [] }],
			feedbacks: [],
		}
		controlIds.push(`timer_${op}`)
	}

	for (const s of self.library) {
		presets[`read_${s.id}`] = {
			type: 'simple',
			name: s.name,
			style: { text: s.name, size: 'auto', color: 0xffffff, bgcolor: 0x000000 },
			steps: [{ down: [{ actionId: 'trigger_read_named', options: { name: s.name } }], up: [] }],
			feedbacks: [
				{
					feedbackId: 'read_is_live',
					options: { name: s.name },
					style: { bgcolor: 0x00aa00, color: 0xffffff },
				},
			],
		}
		readIds.push(`read_${s.id}`)
	}

	const structure = [
		{ id: 'reads', name: 'Reads', definitions: readIds },
		{ id: 'controls', name: 'Show/hide & timer', definitions: controlIds },
	]

	self.setPresetDefinitions(structure, presets)
}
