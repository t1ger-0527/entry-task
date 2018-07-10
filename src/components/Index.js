import once from 'once'
import { h } from '../../framework'
import ActivityCard from './ActivityCard'
import Spinner from './Spinner'
import styles from './Index.css'

const fetchActivity = (query = '', actions, mode = 'replace') => {
  console.log('trigger fetch')
  actions.startSearchActivities()
  fetch('http://localhost:2333/activities')
    .then((res) => res.json())
    .then(({ data: activities }) => {
      actions.updateActivities(activities)
      actions.searchActivitiesSuccess(activities, mode)
    })
}

const handleIndexPageCreate = once((element, actions, state) => {
  fetchActivity('', actions, 'replace')
})

let boundScrollHandler
const THRESHOLD = 100

const documentScrollHandler = (state, actions) => {
  if (state.searchingActivities) return
  const { bottom } = document.scrollingElement.getBoundingClientRect()
  if (bottom < window.innerHeight + THRESHOLD) {
    fetchActivity('', actions, 'append')
  }
}

const handleSpinnerCreate = (element, actions, state) => {
  if (boundScrollHandler) {
    document.removeEventListener('scroll', boundScrollHandler)
    boundScrollHandler = null
  }
  boundScrollHandler = () => documentScrollHandler(state, actions)
  document.addEventListener('scroll', boundScrollHandler)
}

const handleSpinnerDestroy = () => {
  if (boundScrollHandler) {
    document.removeEventListener('scroll', boundScrollHandler)
    boundScrollHandler = null
  }
}

export default () => (state, actions) => {
  const activities = state.searchActivityIds.map((id) => state.activityMap[id])
  return (
    <div key="index" oncreate={(e) => handleIndexPageCreate(e, actions, state)}>
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
      <div
        oncreate={(e) => handleSpinnerCreate(e, actions, state)}
        ondestroy={handleSpinnerDestroy}
        className={styles.spinnerContainer}
      >
        <Spinner />
      </div>
    </div>
  )
}
