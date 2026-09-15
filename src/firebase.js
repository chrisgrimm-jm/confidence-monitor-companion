// Same shared Firebase project the Confidence Monitor teleprompter uses (open/unauthenticated
// read+write, same as every browser client already talking to it — no extra credentials here).
import { initializeApp, getApps, getApp } from '@firebase/app'
import { getDatabase, ref } from '@firebase/database'

const FIREBASE_CONFIG = {
	apiKey: 'AIzaSyBG2PS2muH4i27HefuLeBnZWW-TZ5dkMCw',
	authDomain: 'pinpoint-abf21.firebaseapp.com',
	databaseURL: 'https://pinpoint-abf21-default-rtdb.firebaseio.com',
	projectId: 'pinpoint-abf21',
	storageBucket: 'pinpoint-abf21.firebasestorage.app',
	messagingSenderId: '947703489099',
	appId: '1:947703489099:web:c4ed96cfbaeeda594463ce',
}

export function getDb() {
	const app = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG)
	return getDatabase(app)
}

// matches ppKey() in confidence-monitor/index.html — keep in sync if that ever changes
export function ppKey(topic) {
	return String(topic || '').trim().replace(/[.#$[\]/\s]+/g, '-') || 'adread'
}

export function promptRef(topic, ...path) {
	return ref(getDb(), ['prompter', ppKey(topic), ...path].join('/'))
}
