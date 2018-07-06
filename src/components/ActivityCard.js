import {h} from '../../hyperapp-impl'

export default ({activity, key}) => (
  <div key={key}>{activity.title}</div>
)