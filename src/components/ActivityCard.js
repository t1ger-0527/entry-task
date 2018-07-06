import {h} from '../../hyperapp'
import {Link} from '../../router'

export default ({activity, key}) => (
  <div key={key}>
    <Link to={`/activities/${activity.id}`}>{activity.title}</Link>
  </div>
)