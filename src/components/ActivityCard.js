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
import ChannelItem from './ChannelItem'
import {performActionOnActivity} from '../actions'
import styles from './ActivityCard.css'

export default ({ activityId, key }) => (state, actions) => {
  const activity = state.activityMap[activityId]
  const { starter, channels, detail, title } = activity
  const leavingTimeText = toTimeText(detail.leavingTime)
  const returnTimeText = toTimeText(detail.returnTime)

  return (
    <div className={styles.root} key={key}>
      <div key="head" className={styles.head}>
        <Link className={styles.user} to={`/users/${starter.id}`}>
          <img
            className={styles.avatar}
            src={starter.avatarUrl}
            alt={`${starter.name}'s avatar`}
          />
          <span className={styles.userName}>{starter.name}</span>
        </Link>
        <ChannelItem channel={channels[0]} />
      </div>
      <Link to={`/activities/${activity.id}`} key="title" className={styles.title}>
        {title}
      </Link>
      <Link to={`/activities/${activity.id}`} key="time" className={styles.time}>
        <Icon
          className={styles.timeIcon}
          size={12}
          src={timeIcon}
          topOffset={-1}
        />
        <span className={styles.timeText}>
          {leavingTimeText} - {returnTimeText}
        </span>
      </Link>
      <Link to={`/activities/${activity.id}`} className={styles.description}>
        {truncate(detail.description, 170)}
      </Link>
      <div className={styles.actions}>
        <button
          onclick={performActionOnActivity.bind(
            null,
            activity,
            'meGoing',
            actions,
          )}
          className={cx(styles.actionButton, styles.goingButton, {
            [styles.activeButton]: activity.meGoing,
          })}
        >
          <Icon
            className={styles.actionIcon}
            size={10}
            src={activity.meGoing ? checkIcon : checkIconOutline}
            topOffset={-1}
          />
          {activity.meGoing ? 'I am going!' : `${activity.going.length} Going`}
        </button>
        <button
          onclick={performActionOnActivity.bind(
            null,
            activity,
            'meLiking',
            actions,
          )}
          className={cx(styles.actionButton, styles.likeButton, {
            [styles.activeButton]: activity.meLiking,
          })}
        >
          <Icon
            className={styles.actionIcon}
            size={10}
            src={activity.meLiking ? heartIcon : heartIconOutline}
            topOffset={-1}
          />
          {activity.meLiking ? 'I like it!' : `${activity.liked.length} Likes`}
        </button>
      </div>
    </div>
  )
}
