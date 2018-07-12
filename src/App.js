import cx from 'classnames'
import { h } from '../framework'
import Routes from './Routes'
import TopNav from './components/TopNav'
import Login from './components/Login'
import SidePanel from './components/SidePanel'
import styles from './App.css'

let fetching = true

function handleAppCreate(element, actions) {
  actions.fetchSelfOnce().then(() => (fetching = false))
}

const TouchBlocker = () => (state, actions) => (
  <div
    className={styles.touchBlocker}
    onclick={() => actions.toggleSidePanel(false)}
  />
)

const App = () => (state, actions) => (
  <div
    className={cx(styles.root, {
      [styles.sidePanelActive]: state.isSidePanelActive,
    })}
  >
    <TopNav />
    <div
      className={cx(styles.pageContent, {
        [styles.sidePanelActive]: state.isSidePanelActive,
      })}
    >
      <Routes />
      {state.isSidePanelActive && <TouchBlocker />}
    </div>
    <SidePanel />
  </div>
)

export default (state, actions) => {
  let content
  if (fetching) {
    content = null
  } else if (state.self) {
    content = <App />
  } else {
    content = <Login />
  }
  return <div oncreate={handleAppCreate}>{content}</div>
}
