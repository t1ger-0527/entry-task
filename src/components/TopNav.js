import cx from 'classnames'
import {h} from '../../framework'
import {Link} from '../../router'
import Icon from './Icon'
import logoCat from '../icons/logo-cat.svg'
import search from '../icons/search.svg'
import home from '../icons/home.svg'
import styles from './TopNav.css'

export default (props) => (state, actions) => {
  const isIndex = state.location && state.location.pathname === '/'
  return (
    <nav className={cx(styles.root, {[styles.sidePanelActive]: state.isSidePanelActive})}>
      {isIndex ? (
        <button className={styles.left} onclick={() => actions.toggleSidePanel()}>
          <Icon size={24} src={search} />
        </button>
      ) : (
        <Link to="/" className={styles.left}>
          <Icon size={24} src={home} />
        </Link>
      )}
      <Icon className={styles.logo} src={logoCat} />
      <a href="javascript:;" className={styles.right}>
        <img className={styles.avatar} src={state.self.avatarUrl} alt="my avatar" />
      </a>
    </nav>
  )
}