import { h } from '../../framework'
import { Link } from '../../router'

const handlePageCreate = (id, actions) => {
  fetch(`http://localhost:2333/activities/${id}`)
    .then((res) => res.json())
    .then((activity) => {
      actions.updateActivities(activity)
    })
}

export default ({ params }) => (state, actions) => {
  const { activityId } = params
  const activity = state.activityMap[activityId]
  if (activity) {
    return (
      <div key="detail">
        <div>{activity.title}</div>
        <Link to="/">back to home</Link>
      </div>
    )
  }
  return (
    <div oncreate={() => handlePageCreate(activityId, actions)}>loading</div>
  )
}
