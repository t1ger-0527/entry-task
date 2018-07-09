import {h} from '../../hyperapp'
import styles from './TopNav.css'

export default (props) => (state, actions) => {
  console.log('should render nav')
  return (
    <nav className={styles.root}>
      123a
    </nav>
  )
}