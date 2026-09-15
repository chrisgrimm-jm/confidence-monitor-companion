export default function UpdateVariableDefinitions(self) {
	self.setVariableDefinitions({
		live_read_name: { name: 'Name of the read currently LIVE on the prompter' },
		read_count: { name: 'Number of reads in the script library' },
	})
	self.setVariableValues({
		live_read_name: self.liveName || '',
		read_count: self.library.length || 0,
	})
}
