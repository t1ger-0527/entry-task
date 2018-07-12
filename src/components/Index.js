import once from 'once'
import { h } from '../../framework'
import ActivityCard from './ActivityCard'
import Spinner from './Spinner'
import { getSearchQueryFromState } from './SearchPanel'
import styles from './Index.css'

const fetchActivity = (state, actions, mode = 'replace') => {
  const query = getSearchQueryFromState(state)
  actions.startSearchActivities(mode)
  fetch(`http://10.22.203.174:2333/activities?${query}`)
    .then((res) => res.json())
    .then(({ data: activities }) => {
      actions.updateActivities(activities)
      actions.searchActivitiesSuccess(activities, mode)
    })
}

const handleIndexPageCreate = once((element, actions, state) => {
  fetchActivity(state, actions, 'replace')
})

let boundScrollHandler
const THRESHOLD = 100

const documentScrollHandler = (state, actions) => {
  if (state.searchingActivities) return
  const { bottom } = document.scrollingElement.getBoundingClientRect()
  if (bottom < window.innerHeight + THRESHOLD) {
    fetchActivity(state, actions, 'append')
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
  const activityIds = state.searchActivityIds
  return (
    <div key="index" oncreate={(e) => handleIndexPageCreate(e, actions, state)}>
      {activityIds.map((id) => <ActivityCard key={id} activityId={id} />)}
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
