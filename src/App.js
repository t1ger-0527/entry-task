import { h } from '../hyperapp-impl'
import Index from './components/Index'

export default (state, actions) => {

  return (
    <div>
      <Index state={state} actions={actions} />
    </div>
  )
}
