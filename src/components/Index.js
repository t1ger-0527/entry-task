import { h } from '../../hyperapp-impl'
import ActivityCard from './ActivityCard'

const fetchActivity = (query = '', actions) => {

}

const handleIndexPageCreate = (element, actions, state) => {
  fetchActivity('', actions)
}

export default (state, actions) => {
  return (
    <div
      class="Index-root"
      oncreate={(e) => handleIndexPageCreate(e, actions, state)}
    />
  )
}
