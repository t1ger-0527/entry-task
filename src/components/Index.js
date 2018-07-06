import { h } from '../../hyperapp-impl'
import ActivityCard from './ActivityCard'

const fetchActivity = (query = '', actions) => {
  fetch('http://localhost:2333/activities')
    .then(res => res.json())
    .then(({data: activities}) => {
      actions.updateActivities(activities)
      actions.searchActivitiesSuccess(activities)
    })
}

const handleIndexPageCreate = (element, actions, state) => {
  fetchActivity('', actions)
}

export default ({state, actions}) => {
  const activities = state.searchActivityIds.map(id => state.activityMap[id])
  return (
    <div
      class="Index-root"
      oncreate={(e) => handleIndexPageCreate(e, actions, state)}
    >
      {activities.map(activity => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  )
}
