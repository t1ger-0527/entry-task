import cx from 'classnames'
import { h } from '../../framework'
import { Route } from '../../router'
import SearchPanel from './SearchPanel'
import styles from './SidePanel.css'

export default () => (state, actions) => {
  return (
    <div className={styles.root}>
      <div
        className={cx(styles.content, {
          [styles.active]: state.isSidePanelActive,
        })}
      >
        <Route path="/" render={SearchPanel} />
      </div>
    </div>
  )
}
