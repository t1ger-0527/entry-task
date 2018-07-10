import { h } from '../framework'
import Routes from './Routes'
import TopNav from './components/TopNav'
import Login from './components/Login'
import styles from './App.css'

let fetching = true

function handleAppCreate(element, actions) {
  actions.fetchSelfOnce().then(() => (fetching = false))
}

const App = () => (
  <div className={styles.root}>
    <TopNav />
    <Routes />
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
