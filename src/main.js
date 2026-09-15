import { InstanceBase, InstanceStatus } from '@companion-module/base'
import { onValue } from '@firebase/database'
import { promptRef } from './firebase.js'
import { UpgradeScripts as upgradeScripts } from './upgrades.js'
import UpdateActions from './actions.js'
import UpdateFeedbacks from './feedbacks.js'
import UpdateVariableDefinitions from './variables.js'

// as of @companion-module/base v2, the host imports this file directly and reads the default
// export as the instance class, plus this named export for upgrade scripts -- there is no
// runEntrypoint() call to make (that was removed; see the package's CHANGELOG.md).
export const UpgradeScripts = upgradeScripts

export default class ModuleInstance extends InstanceBase {
	async init(config) {
		this.config = config
		this.library = [] // [{id, name}], live from Firebase prompter/<topic>/scripts
		this.liveName = '' // name of whichever read is currently on the prompter
		this.scriptsUnsub = null
		this.contentUnsub = null

		this.updateStatus(InstanceStatus.Connecting)
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()
		this.subscribe()
	}

	async destroy() {
		this.unsubscribe()
	}

	async configUpdated(config) {
		this.unsubscribe()
		this.config = config
		this.library = []
		this.liveName = ''
		this.updateStatus(InstanceStatus.Connecting)
		this.updateActions()
		this.updateFeedbacks()
		this.subscribe()
	}

	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'topic',
				label: "Topic (must match the Topic field in Confidence Monitor's Teleprompter card)",
				width: 8,
				default: 'adread',
			},
		]
	}

	subscribe() {
		const scriptsRef = promptRef(this.config.topic, 'scripts')
		const contentRef = promptRef(this.config.topic, 'content')

		this.scriptsUnsub = onValue(
			scriptsRef,
			(snap) => {
				const v = snap.val() || {}
				this.library = Object.keys(v).map((k) => ({ id: k, name: v[k].name || 'Untitled' }))
				this.setVariableValues({ read_count: this.library.length })
				this.updateActions()
				this.updateFeedbacks()
				this.updateStatus(InstanceStatus.Ok)
			},
			(err) => this.updateStatus(InstanceStatus.ConnectionFailure, err.message),
		)

		this.contentUnsub = onValue(contentRef, (snap) => {
			const v = snap.val() || {}
			this.liveName = v.name || ''
			this.setVariableValues({ live_read_name: this.liveName })
			this.checkFeedbacks('read_is_live')
		})
	}

	unsubscribe() {
		if (this.scriptsUnsub) this.scriptsUnsub()
		if (this.contentUnsub) this.contentUnsub()
		this.scriptsUnsub = null
		this.contentUnsub = null
	}

	updateActions() {
		UpdateActions(this)
	}
	updateFeedbacks() {
		UpdateFeedbacks(this)
	}
	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}
}
