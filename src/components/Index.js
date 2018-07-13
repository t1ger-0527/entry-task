import once from 'once'
import { h } from '../../framework'
import ActivityCard from './ActivityCard'
import Spinner from './Spinner'
import { getSearchQueryFromState, getSearchText } from './SearchPanel'
import styles from './Index.css'

const handleIndexPageCreate = once((element, actions, state) => {
  actions.fetchActivity('replace')
})

let boundScrollHandler
const THRESHOLD = 100

const documentScrollHandler = (state, actions) => {
  if (state.searchingActivities) return
  const { bottom } = document.scrollingElement.getBoundingClientRect()
  if (bottom < window.innerHeight + THRESHOLD) {
    actions.fetchActivity('append')
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

const anchor = []

const SearchStatus = () => (state, actions) => {
  if (!state.currentSearching) return null

  const {resultCount} = state.currentSearching
  return (
    <div className={styles.searchStatus} oncreate={() => anchor[0].scrollIntoView()}>
      <span className={styles.topAnchor} oncreate={e => anchor[0] = e} />
      <div className={styles.searchResultStatus}>
        <span className={styles.searchResultCount}>
          {resultCount} Results
        </span>
        <button className={styles.clearSearchButton} onclick={() => {
          actions.updateCurrentSearching(null)
          actions.searchPanel.reset()
          actions.fetchActivity('replace')
        }}>
          CLEAR SEARCH
        </button>
      </div>
      <div className={styles.searchDetail}>
        Searched for {getSearchText(state)}
      </div>
    </div>
  )
}

export default () => (state, actions) => {
  const activityIds = state.searchActivityIds
  return (
    <div key="index" oncreate={(e) => handleIndexPageCreate(e, actions, state)}>
      <SearchStatus />
      <div>
        {activityIds.map((id) => <ActivityCard key={id} activityId={id} />)}
      </div>
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
