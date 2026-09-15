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
	})
}
