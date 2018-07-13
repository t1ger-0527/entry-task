import cx from 'classnames'
import { h } from '../../framework'
import { Route, Link } from '../../router'
import Icon from './Icon'
import mailIcon from '../icons/email.svg'
import infoIcon from '../icons/info.svg'
import peopleIcon from '../icons/people.svg'
import commentIcon from '../icons/comment.svg'
import infoIconOutline from '../icons/info-outline.svg'
import peopleIconOutline from '../icons/people-outline.svg'
import commentIconOutline from '../icons/comment-outline.svg'
import Spinner from './Spinner'
import ActivityCard from './ActivityCard'
import styles from './UserPage.css'

const NavItem = ({ iconSrc, text, href }) => (state, actions) => {
  return (
    <Link
      to={href || ''}
      activeClassName={styles.activeNavItem}
      className={styles.navItem}
      render={(match) => (
        <span>
          <Icon
            className={styles.navIcon}
            src={iconSrc[match ? 'active' : 'inactive']}
            size={17}
            topOffset={-3}
          />
          {text}
        </span>
      )}
    />
  )
}

let boundScrollHandler
const THRESHOLD = 100
const documentScrollHandler = (state, actions) => {
  if (state.searchingActivities) return
  const { bottom } = document.scrollingElement.getBoundingClientRect()
  if (bottom < window.innerHeight + THRESHOLD) {
    actions.fetchActivity('append')
  }
}

const handleSpinnerCreate = (element, actions, state) => {
  if (boundScrollHandler) {
    document.removeEventListener('scroll', boundScrollHandler)
    boundScrollHandler = null
  }
  boundScrollHandler = () => documentScrollHandler(state, actions)
  document.addEventListener('scroll', boundScrollHandler)
}

const ActivityList = ({activityIds}) => (state, actions) => {
  return (
    <div>
      {activityIds.map((activityId) => (
        <ActivityCard activityId={activityId} key={activityId} />
      ))}
      <div
        oncreate={e => handleSpinnerCreate(e, actions, state)}
        className={styles.spinnerContainer}
      >
        <Spinner />
      </div>
    </div>
  )
}

// TODO: use different ids
const GoList = () => (state, actions) => {
  return <ActivityList activityIds={state.searchActivityIds} />
}

const LikeList = () => (state, actions) => {
  return <ActivityList activityIds={state.searchActivityIds} />
}

const PastList = () => (state, actions) => {
  return <ActivityList activityIds={state.searchActivityIds} />
}

export default (props) => (state, actions) => {
  const { params } = props
  const { userId } = params
  const user = userId === 'me' ? state.self : state.userMap[userId]

  return (
    <div
      userId={userId}
      className={styles.root}
      oncreate={() => {
        if (userId !== 'me') {
          actions.fetchUser(userId)
        }
        document.documentElement.scrollTo({top: 0})
        actions.fetchActivity('replace')
      }}
      onupdate={(e, oldProps, newProps) => {
        const {userId} = newProps
        const {userId: prevId} = oldProps
        if (prevId === userId) return

        if (userId !== 'me') {
          actions.fetchUser(userId)
        }
        document.documentElement.scrollTo({top: 0})
        actions.fetchActivity('replace')
      }}
    >
      <header className={styles.header}>
        <div className={styles.avatarContainer}>
          <img className={styles.avatar} src={user && user.avatarUrl} alt="my avatar" />
        </div>
        <div className={styles.userName}>{user && user.name}</div>
        <div className={styles.emailAddress}>
          <Icon
            className={styles.mailIcon}
            src={mailIcon}
            width={16}
            height={13}
            topOffset={-2}
          />
          {user && user.email}
        </div>
      </header>
      <nav className={styles.nav}>
        <NavItem
          href={`/users/${userId}`}
          iconSrc={{ active: infoIcon, inactive: infoIconOutline }}
          text={`${user && user.likeCount} Likes`}
        />
        <NavItem
          href={`/users/${userId}/going`}
          iconSrc={{ active: peopleIcon, inactive: peopleIconOutline }}
          text={`${user && user.goCount} Going`}
        />
        <NavItem
          href={`/users/${userId}/past`}
          iconSrc={{ active: commentIcon, inactive: commentIconOutline }}
          text={`${user && user.pastCount} Past`}
        />
      </nav>
      <Route path="/users/:userId" render={LikeList} />
      <Route path="/users/:userId/going" render={GoList} />
      <Route path="/users/:userId/past" render={PastList} />
    </div>
  )
}
