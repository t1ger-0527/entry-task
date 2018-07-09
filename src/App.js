import { h } from '../hyperapp'
import { Route } from '../router'
import Index from './components/Index'
import ActivityDetail from './components/ActivityDetail'
import TopNav from './components/TopNav'

export default (state, actions) => {
  return (
    <div>
      <TopNav />
      <Route path="/" render={Index} />
      <Route path="/activities/:activityId" render={ActivityDetail} />
    </div>
  )
}
