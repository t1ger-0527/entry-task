import 'whatwg-fetch'
import { app, h } from '../framework'
import actions from './actions'
import state from './state'
import App from './App'
import { location } from '../router'

const wiredActions = app(state, actions, App, document.getElementById('root'))
location.subscribe(wiredActions.location)
