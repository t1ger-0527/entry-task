import { h } from '../../hyperapp'
import { Link } from '../../router'
import Icon from '../components/Icon'
import timeIcon from '../icons/time.svg'
import checkIcon from '../icons/check.svg'
import heartIcon from '../icons/like.svg'
import { toTimeText } from '../lib/date'
import truncate from '../lib/truncate'
import styles from './ActivityCard.css'

export default ({ activity, key }) => {
  const { starter, channels, detail, title } = activity
  const leavingTimeText = toTimeText(detail.leavingTime)
  const returnTimeText = toTimeText(detail.returnTime)
  return (
    <Link to={`/activities/${activity.id}`} className={styles.root} key={key}>
      <div key="head" className={styles.head}>
        <div className={styles.user}>
          <img
            className={styles.avatar}
            src={starter.avatarUrl}
            alt={`${starter.name}'s avatar`}
          />
          <span className={styles.userName}>{starter.name}</span>
        </div>
        <div className={styles.channel}>{channels[0].name}</div>
      </div>
      <div key="title" className={styles.title}>
        {title}
      </div>
      <div key="time" className={styles.time}>
        <Icon className={styles.timeIcon} size={12} src={timeIcon} topOffset={-1} />
        <span className={styles.timeText}>
          {leavingTimeText} - {returnTimeText}
        </span>
      </div>
      <div className={styles.description}>
        {truncate(detail.description, 170)}
      </div>
    </Link>
  )
}
