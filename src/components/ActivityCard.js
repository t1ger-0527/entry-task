import cx from 'classnames'
import { h } from '../../framework'
import { Link } from '../../router'
import Icon from '../components/Icon'
import timeIcon from '../icons/time.svg'
import checkIcon from '../icons/check.svg'
import checkIconOutline from '../icons/check-outline.svg'
import heartIcon from '../icons/like.svg'
import heartIconOutline from '../icons/like-outline.svg'
import { toTimeText } from '../lib/date'
import truncate from '../lib/truncate'
import styles from './ActivityCard.css'

export default ({ activity, key }) => {
  const { starter, channels, detail, title } = activity
  const leavingTimeText = toTimeText(detail.leavingTime)
  const returnTimeText = toTimeText(detail.returnTime)

  // TODO: left out here at the like button.
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
        <Icon
          className={styles.timeIcon}
          size={12}
          src={timeIcon}
          topOffset={-1}
        />
        <span className={styles.timeText}>
          {leavingTimeText} - {returnTimeText}
        </span>
      </div>
      <div className={styles.description}>
        {truncate(detail.description, 170)}
      </div>
      <div className={styles.actions}>
        <button
          className={cx(styles.actionButton, styles.goingButton, {
            [styles.activeButton]: activity.me_going,
          })}
        >
          <Icon
            className={styles.actionIcon}
            size={10}
            src={activity.me_going ? checkIcon : checkIconOutline}
            topOffset={-1}
          />
          {activity.me_going ? 'I am going!' : `${activity.going.length} Going`}
        </button>
        <button
          className={cx(styles.actionButton, styles.likeButton, {
            [styles.activeButton]: activity.me_liking,
          })}
        >
          <Icon
            className={styles.actionIcon}
            size={10}
            src={activity.me_liking ? heartIcon : heartIconOutline}
            topOffset={-1}
          />
          {activity.me_liking ? 'I like it!' : `${activity.liked.length} Likes`}
        </button>
      </div>
    </Link>
  )
}
