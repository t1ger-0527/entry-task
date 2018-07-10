import { h } from '../framework'
import { Route } from '../router'
import Index from './components/Index'
import ActivityDetail from './components/ActivityDetail'
import TopNav from './components/TopNav'
import styles from './App.css'

function handleAppCreate(element, actions) {
  actions.fetchSelfOnce()
}

export default (state, actions) => {
  return (
    <div className={styles.root} oncreate={handleAppCreate}>
      <TopNav />
      <Route path="/" render={Index} />
      <Route path="/activities/:activityId" render={ActivityDetail} />
    </div>
  )
}
