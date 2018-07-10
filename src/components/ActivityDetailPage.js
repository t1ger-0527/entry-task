import cx from 'classnames'
import { format, distanceInWordsStrict } from 'date-fns'
import { h } from '../../framework'
import Spinner from './Spinner'
import { Link } from '../../router'
import infoIcon from '../icons/info.svg'
import peopleIcon from '../icons/people.svg'
import commentIcon from '../icons/comment.svg'
import infoIconOutline from '../icons/info-outline.svg'
import peopleIconOutline from '../icons/people-outline.svg'
import commentIconOutline from '../icons/comment-outline.svg'
import replyIcon from '../icons/reply.svg'
import fromIcon from '../icons/date-from.svg'
import toIcon from '../icons/date-to.svg'
import ChannelItem from './ChannelItem'
import Icon from './Icon'
import styles from './ActivityDetailPage.css'

const handlePageCreate = (id, actions) => {
  document.scrollingElement.scroll({ top: 0 })
  fetch(`http://localhost:2333/activities/${id}`)
    .then((res) => res.json())
    .then((activity) => {
      actions.updateActivities(activity)
    })
}

const handleNavCreate = () => {}

const NavItem = ({ index, iconSrc, text }) => (state) => {
  const isActive = state.detailPage.navActiveIndex === index
  return (
    <div
      className={cx(styles.navItem, {
        [styles.activeNavItem]: isActive,
      })}
    >
      <Icon
        className={styles.navIcon}
        src={iconSrc[isActive ? 'active' : 'inactive']}
        size={17}
        topOffset={-3}
      />
      {text}
    </div>
  )
}

const TimeDisplay = ({ timestamp, iconSrc }) => {
  return (
    <div className={styles.timeDisplay}>
      <div className={styles.dateLine}>
        <Icon
          class={styles.dateIcon}
          src={iconSrc}
          width={14}
          height={16}
          topOffset={-3}
        />
        {format(timestamp, 'DD MMMM YYYY')}
      </div>
      <div className={styles.timeLine}>
        {format(timestamp, 'h:mm')}
        <span className={styles.suffix}>{format(timestamp, 'a')}</span>
      </div>
    </div>
  )
}

const CommentItem = ({ comment, activity }) => {
  const { author } = comment
  return (
    <div className={styles.commentItem}>
      <img
        className={styles.commentAuthorAvatar}
        src={author.avatarUrl}
        alt="comment author avatar"
      />
      <div className={styles.commentContentContainer}>
        <div className={styles.commentAuthor}>
          {comment.author.name}
          <span className={styles.commentCreateTime}>
            {distanceInWordsStrict(Date.now(), comment.created)} ago
          </span>
        </div>
        <div className={styles.commentContent}>{comment.content}</div>
      </div>
      <button className={styles.replyButton}>
        <Icon
          className={styles.replyIcon}
          src={replyIcon}
          width={16}
          height={13}
        />
      </button>
    </div>
  )
}

const handlePageDestroy = (e, actions) => {
  // TODO: recover the page state here.
}

const handleTruncateTailClick = (e, actions) => {
  actions.detailPage.expandDescription()
}

export default ({ params }) => (state, actions) => {
  const { activityId } = params
  const activity = state.activityMap[activityId]
  const {
    detailPage: { isTruncated },
  } = state
  if (activity) {
    const {
      title,
      channels,
      starter,
      comments,
      detail: {
        images,
        description,
        leavingTime,
        returnTime,
        address,
        embedMapUrl,
      },
    } = activity

    return (
      <div
        className={styles.root}
        key="detail"
        oncreate={() => handlePageCreate(activityId, actions)}
        ondestroy={handlePageDestroy}
      >
        <header className={styles.header}>
          <div className={styles.channels}>
            {channels.map((c) => <ChannelItem channel={c} key={c.id} />)}
          </div>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.user}>
            <img
              className={styles.userAvatar}
              src={starter.avatarUrl}
              alt={`${starter.name}'s avatar`}
            />
            <span className={styles.userDescription}>
              <div className={styles.userName}>{starter.name}</div>
              <div className={styles.publishTime}>Published 2 days ago.</div>
            </span>
          </div>
        </header>
        <nav className={styles.nav} oncreate={handleNavCreate}>
          <NavItem
            index={0}
            iconSrc={{ active: infoIcon, inactive: infoIconOutline }}
            text="Details"
          />
          <NavItem
            index={1}
            iconSrc={{ active: peopleIcon, inactive: peopleIconOutline }}
            text="Participants"
          />
          <NavItem
            index={2}
            iconSrc={{ active: commentIcon, inactive: commentIconOutline }}
            text="Comments"
          />
        </nav>
        <section className={styles.detail}>
          <div className={styles.horizontalScroll}>
            {images.map((imgSrc) => (
              <div className={styles.imageContainer}>
                <img
                  className={styles.image}
                  src={imgSrc}
                  alt="activity images"
                />
              </div>
            ))}
            <div className={styles.rightPadding} />
          </div>
          <div
            className={cx(styles.description, {
              [styles.truncated]: isTruncated,
            })}
            onclick={handleTruncateTailClick}
          >
            {description}
            {isTruncated && (
              <div
                className={styles.truncateTail}
                onclick={handleTruncateTailClick}
              >
                <button className={styles.truncateButton}>VIEW ALL</button>
              </div>
            )}
          </div>
          <div className={styles.marginPlaceholder} />
          <div className={styles.detailSection}>
            <div className={styles.sectionTitle}>When</div>
            <div className={styles.timeDisplaySection}>
              <TimeDisplay timestamp={leavingTime} iconSrc={fromIcon} />
              <TimeDisplay timestamp={returnTime} iconSrc={toIcon} />
            </div>
          </div>
          <div className={styles.marginPlaceholder} />
          <div className={styles.detailSection}>
            <div className={styles.sectionTitle}>Where</div>
            <address>
              <div className={styles.addressFirstLine}>{address.firstLine}</div>
              <div className={styles.addressSecondLine}>
                {address.secondLine}
              </div>
            </address>
            <div className={styles.mapContainer}>
              <iframe
                className={styles.map}
                src={embedMapUrl}
                frameborder="0"
              />
            </div>
          </div>
          <div className={styles.commentSection}>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                activity={activity}
              />
            ))}
          </div>
        </section>
      </div>
    )
  }
  return (
    <div
      className={styles.spinnerContainer}
      oncreate={() => handlePageCreate(activityId, actions)}
    >
      <Spinner />
    </div>
  )
}
