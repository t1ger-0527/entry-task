import {h} from '../../framework'
import styles from './ChannelItem.css'

export default ({channel}) => (
  <div className={styles.root}>{channel.name}</div>
)