import 'whatwg-fetch'
import { app, h } from '../hyperapp-impl'
import actions from './actions'
import state from './state'
import App from './App'

const wiredActions = app(state, actions, App, document.documentElement)
