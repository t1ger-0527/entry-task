import {h} from '../../hyperapp'
import Icon from './Icon'
import logoCat from '../icons/logo-cat.svg'
import search from '../icons/search.svg'
import styles from './TopNav.css'

export default (props) => (state, actions) => {
  return (
    <nav className={styles.root}>
      <Icon className={styles.left} src={search} />
      <Icon className={styles.logo} src={logoCat} />
      <a href="javascript:;" className={styles.right}>
        <img className={styles.avatar} src={state.self.avatarUrl} alt="my avatar" />
      </a>
    </nav>
  )
}