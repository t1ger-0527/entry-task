import { h } from '../framework'
import { Route } from '../router'
import Index from './components/Index'
import ActivityDetailPage from './components/ActivityDetailPage'

export default () => (
  <div>
    <Route path="/" render={Index} />
    <Route path="/activities/:activityId" render={ActivityDetailPage} />
  </div>
)
