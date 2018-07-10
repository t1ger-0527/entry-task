import { h } from '../framework'
import { Route } from '../router'
import Index from './components/Index'
import ActivityDetail from './components/ActivityDetail'

export default () => (
  <div>
    <Route path="/" render={Index} />
    <Route path="/activities/:activityId" render={ActivityDetail} />
  </div>
)
