import {h} from '../framework'
import matchRoute from './matchRoute'

export default (props) => (state) => {
  const Node = props.render

  const location = state.location
  const params = matchRoute(props.path, location.pathname, props.exact)

  if (params) {
    return (
      <Node params={params} location={location} />
    )
  } else {
    return null
  }
}