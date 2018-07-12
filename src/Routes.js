import { h } from '../framework'
import { Route } from '../router'
import Index from './components/Index'
import ActivityDetailPage from './components/ActivityDetailPage'
import styles from './App.css'

export default () => (
  <div className={styles.routes}>
    <Route path="/" render={Index} />
    <Route path="/activities/:activityId" render={ActivityDetailPage} />
  </div>
)
