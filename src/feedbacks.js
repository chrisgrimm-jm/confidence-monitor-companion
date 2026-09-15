import { SHOW_ELEMENTS } from './actions.js'

export default function UpdateFeedbacks(self) {
	const choices = self.library.length
		? self.library.map((s) => ({ id: s.name, label: s.name }))
		: [{ id: '', label: '(script library not loaded yet)' }]

	self.setFeedbackDefinitions({
		read_is_live: {
			type: 'boolean',
			name: 'Read is LIVE',
			description: 'True when the selected read is the one currently on the prompter',
			defaultStyle: { bgcolor: 0x00aa00, color: 0xffffff },
			options: [
				{
					id: 'name',
					type: 'dropdown',
					label: 'Read',
					choices,
					default: choices[0].id,
				},
			],
			callback: (feedback) => {
				const want = (feedback.options.name || '').trim().toLowerCase()
				return !!want && self.liveName.trim().toLowerCase() === want
			},
		},
		element_is_shown: {
			type: 'boolean',
			name: 'Overlay element is shown',
			description: 'True when the selected element is currently visible on the confidence monitor',
			defaultStyle: { bgcolor: 0x00aa00, color: 0xffffff },
			options: [
				{
					id: 'element',
					type: 'dropdown',
					label: 'Element',
					choices: SHOW_ELEMENTS.map((e) => ({ id: e.id, label: e.label })),
					default: SHOW_ELEMENTS[0].id,
				},
			],
			callback: (feedback) => {
				const el = SHOW_ELEMENTS.find((e) => e.id === feedback.options.element)
				return !!el && !!self.uiState[el.key]
			},
		},
	})
}
