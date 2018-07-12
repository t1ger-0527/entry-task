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
import commentPrimary from '../icons/comment-primary.svg'
import likePrimary from '../icons/like-primary.svg'
import likeComplement from '../icons/like-complement.svg'
import checkOutline from '../icons/check-outline.svg'
import likeOutline from '../icons/like-outline.svg'
import expandIcon from '../icons/expand.svg'
import checkPrimary from '../icons/check-primary.svg'
import checkComplement from '../icons/check-outline-complement.svg'
import closeIcon from '../icons/cross.svg'
import sendIcon from '../icons/send.svg'
import ChannelItem from './ChannelItem'
import { performActionOnActivity } from '../actions'
import Icon from './Icon'
import styles from './ActivityDetailPage.css'

const handlePageCreate = (id, actions) => {
  document.scrollingElement.scroll({ top: 0 })
  fetch(`http://10.22.203.174:2333/activities/${id}`)
    .then((res) => res.json())
    .then((activity) => {
      actions.updateActivities(activity)
    })
  document.addEventListener('scroll', () => {
    let activeNavIndex = anchors.findIndex((anchor) => {
      if (anchor) {
        const { top } = anchor.getBoundingClientRect()
        return top > 0
      } else {
        return true
      }
    })
    if (activeNavIndex === -1) {
      activeNavIndex = 2
    } else if (activeNavIndex === 0) {
      activeNavIndex = 0
    } else {
      activeNavIndex -= 1
    }
    actions.detailPage.updateNavActiveIndex(activeNavIndex)
  })
}

const handleNavClick = (index, e, actions) => {
  actions.detailPage.updateNavActiveIndex(index)
  if (anchors[index]) {
    anchors[index].scrollIntoView()
  }
}

const NavItem = ({ index, iconSrc, text }) => (state) => {
  const isActive = state.detailPage.navActiveIndex === index
  return (
    <div
      onclick={handleNavClick.bind(null, index)}
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

// TODO: mention should be clickable
const CommentItem = ({ comment, activity, key }) => {
  const { author, replying } = comment
  const handleReplyButtonClick = (e, actions) => {
    actions.detailPage.toggleReplying(author)
  }
  return (
    <div key={key} className={styles.commentItem}>
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
        <div className={styles.commentContent}>
          {replying && <span className={styles.mention}>@{replying.name}</span>}{' '}
          {comment.content}
        </div>
      </div>
      <button onclick={handleReplyButtonClick} className={styles.replyButton}>
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
  actions.resetDetailPage()
}

const handleSubmitComment = (activity, replyingTo, e, actions) => {
  e.preventDefault()
  const content = e.target.elements[1].value
  fetch(`http://10.22.203.174:2333/activities/${activity.id}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content, replyingTo: replyingTo && replyingTo.id }),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => res.json())
    .then((activity) => actions.updateActivities(activity))
    .then(() => {
      actions.detailPage.toggleCommenting()
      setTimeout(() => {
        window.scrollTo({
          top: document.scrollingElement.getBoundingClientRect().height,
        })
      }, 16.667)
    })
}

const handleTruncateTailClick = (e, actions) => {
  actions.detailPage.expandDescription()
}

const UserAvatarListLine = ({ users, key, isFlex }) => (
  <div className={styles.userAvatarLine} key={key}>
    {users.map(
      (user, index) =>
        user ? (
          <img
            className={styles.userAvatarItem}
            key={user.id}
            src={user.avatarUrl}
            alt="user avatar"
          />
        ) : (
          <div className={styles.userAvatarItem} key={index} />
        ),
    )}
  </div>
)

let anchors = []

const alignUserList = (users, length) =>
  users.concat([...Array(length - users.length).keys()].map(() => null))
const UserAvatarList = ({ users, key }) => (state, actions) => {
  // TODO: decide maximun number by window size
  const maxUserNumber = 7
  const expanded = state.detailPage.userListsExpanded[key]
  const handleExpand = (e, actions) => {
    actions.detailPage.expandUserList(key)
  }
  let userLines = []
  if (expanded) {
    userLines = users.reduce((a, user, index) => {
      const lineNumber = Math.floor(index / maxUserNumber)
      if (!a[lineNumber]) {
        a[lineNumber] = []
      }
      a[lineNumber].push(user)
      return a
    }, [])
  }
  return (
    <div className={styles.userAvatarList}>
      {expanded ? (
        userLines.map((userLine, i) => (
          <UserAvatarListLine
            key={i}
            users={alignUserList(userLine, maxUserNumber)}
          />
        ))
      ) : (
        <UserAvatarListLine
          users={alignUserList(users.slice(0, maxUserNumber), maxUserNumber)}
        />
      )}
      {users.length > maxUserNumber &&
        !expanded && (
          <button className={styles.expandUserList} onclick={handleExpand}>
            <Icon src={expandIcon} size={16} />
          </button>
        )}
    </div>
  )
}

export default ({ params }) => (state, actions) => {
  const { activityId } = params
  const activity = state.activityMap[activityId]
  const { isTruncated, commenting, replyingTo } = state.detailPage
  const { toggleCommenting } = actions.detailPage
  const handleSubmitCommentImpl = handleSubmitComment.bind(
    null,
    activity,
    replyingTo,
  )
  const likeActivity = performActionOnActivity.bind(
    null,
    activity,
    'meLiking',
    actions,
  )
  const goActivity = performActionOnActivity.bind(
    null,
    activity,
    'meGoing',
    actions,
  )
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
      meLiking,
      meGoing,
    } = activity

    const toolbarButtonSet = [
      <button
        key="comment"
        className={styles.commentButton}
        onclick={toggleCommenting}
      >
        <Icon src={commentPrimary} size={24} />
      </button>,
      <button key="like" className={styles.likeButton} onclick={likeActivity}>
        <Icon src={meLiking ? likeComplement : likePrimary} size={24} />
      </button>,
      <button
        key="go"
        className={cx(styles.goButton, { [styles.activeButton]: meGoing })}
        onclick={goActivity}
      >
        <Icon
          className={styles.goIcon}
          src={meGoing ? checkPrimary : checkComplement}
          size={24}
          topOffset={-6}
        />
        {meGoing ? 'I am going' : 'Join'}
      </button>,
    ]

    const toolbarCommentSection = (
      <form className={styles.commentForm} onsubmit={handleSubmitCommentImpl}>
        <div className={styles.inputContainer}>
          <button className={styles.closeComment} onclick={toggleCommenting}>
            <Icon src={closeIcon} size={16} />
          </button>
          <input
            autofocus
            oncreate={(e) => e.focus()}
            className={styles.commentInput}
            placeholder={
              replyingTo
                ? `Reply @${replyingTo.name}`
                : 'Leave your comment here'
            }
            name="comment"
            type="text"
          />
        </div>
        <button className={styles.submitCommentButton} type="submit">
          <Icon src={sendIcon} width={28} height={24} />
        </button>
      </form>
    )

    const detail = (
      <section className={styles.detail}>
        <span className={styles.anchor} oncreate={(e) => (anchors[0] = e)} />
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
              <button
                onclick={handleTruncateTailClick}
                className={styles.truncateButton}
              >
                VIEW ALL
              </button>
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
            <div className={styles.addressSecondLine}>{address.secondLine}</div>
          </address>
          <div className={styles.mapContainer}>
            <iframe className={styles.map} src={embedMapUrl} frameBorder="0" />
          </div>
        </div>
      </section>
    )

    const commentNodes = (
      <div className={styles.commentSection}>
        <span className={styles.anchor} oncreate={(e) => (anchors[2] = e)} />
        <span>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              activity={activity}
            />
          ))}
        </span>
      </div>
    )

    const header = (
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
    )

    const nav = (
      <nav className={styles.nav}>
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
    )

    const goingUserList = (
      <div className={styles.goingUserList}>
        <span className={styles.anchor} oncreate={(e) => (anchors[1] = e)} />
        <div className={styles.userListTitle}>
          <Icon
            className={styles.userListIcon}
            src={checkOutline}
            size={13}
            topOffset={-2}
          />
          {activity.going.length} going
        </div>
        <UserAvatarList users={activity.going} key="going" />
      </div>
    )

    const likingUserList = (
      <div className={styles.likingUserList}>
        <div className={styles.userListTitle}>
          <Icon
            className={styles.userListIcon}
            src={likeOutline}
            size={13}
            topOffset={-2}
          />
          {activity.liked.length} likes
        </div>
        <UserAvatarList users={activity.liked} key="liked" />
      </div>
    )

    return (
      <div
        className={styles.root}
        key="detail"
        oncreate={() => handlePageCreate(activityId, actions)}
        ondestroy={handlePageDestroy}
      >
        {header}
        {nav}
        {detail}
        {goingUserList}
        <div className={styles.marginPlaceholder} />
        {likingUserList}
        {commentNodes}
        <div className={styles.bottomToolBarPlaceholder} />
        <div className={styles.bottomToolBar}>
          {commenting ? toolbarCommentSection : toolbarButtonSet}
        </div>
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
