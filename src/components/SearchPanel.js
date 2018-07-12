import cx from 'classnames'
import { h } from '../../framework'
import Icon from './Icon'
import searchIcon from '../icons/search.svg'
import styles from './SearchPanel.css'

const dateTags = [
  'ANYTIME',
  'TODAY',
  'TOMORROW',
  'THIS WEEK',
  'THIS MONTH',
  'LATER',
]

const channelTags = [
  'All',
  'Channel Foo',
  'Channel Bar',
  'Channel Short',
  'Channel Long',
  'Channel 7',
  'Channel 42',
  'Channel 99',
  'Channel Batman',
]

const DateTag = ({ tagName }) => (state, actions) => {
  const isActive =
    state.searchPanel.activeDateTag === tagName ||
    (tagName === 'ANYTIME' && !state.searchPanel.activeDateTag)
  return (
    <button
      key={tagName}
      className={cx(styles.dateTag, {
        [styles.active]: isActive,
      })}
      onclick={() => actions.searchPanel.toggleDateTag(tagName)}
    >
      {tagName}
    </button>
  )
}

const ChannelTag = ({ tagName }) => (state, actions) => {
  const isActive =
    state.searchPanel.activeChannelTags.find((t) => t === tagName) ||
    (tagName === 'All' && state.searchPanel.activeChannelTags.length === 0)
  return (
    <button
      key={tagName}
      className={cx(styles.channelTag, {
        [styles.active]: isActive,
      })}
      onclick={() => actions.searchPanel.toggleChannelTag(tagName)}
    >
      {tagName}
    </button>
  )
}

const SearchDetail = () => (state) => {
  const { activeChannelTags, activeDateTag } = state.searchPanel
  if (!activeDateTag && activeChannelTags.length === 0) return 'All activities'
  const channelSearchText =
    activeChannelTags.length > 0
      ? activeChannelTags.join(' & ') + ' activities '
      : ''
  const dateSearchText = activeDateTag
    ? activeDateTag.toLowerCase()
    : 'any time.'
  let searchText
  if (!channelSearchText) {
    searchText = `Activities at ${dateSearchText}`
  } else {
    searchText = `${channelSearchText}${dateSearchText}`
  }
  return <div className={styles.searchText}>{searchText}</div>
}

export const getSearchQueryFromState = (state) =>
  `d=${state.searchPanel.activeDateTag ||
    ''}&c=${state.searchPanel.activeChannelTags.join(',')}`

const handleSearch = (state, actions) => {
  actions.toggleSidePanel(false)
  const query = getSearchQueryFromState(state)
  actions.startSearchActivities('replace')
  fetch(`http://10.22.203.174:2333/activities?${query}`)
    .then((res) => res.json())
    .then(({ data: activities }) => {
      actions.updateActivities(activities)
      actions.searchActivitiesSuccess(activities, 'replace')
    })
}

export default () => (state, actions) => {
  return (
    <section className={styles.root} ondestroy={actions.searchPanel.reset}>
      <div className={styles.sectionTitle}>DATE</div>
      <div className={styles.dateTagSection}>
        {dateTags.map((tagName) => <DateTag tagName={tagName} key={tagName} />)}
      </div>
      <div className={cx(styles.sectionTitle, styles.secondChannel)}>
        CHANNEL
      </div>
      <div className={styles.channelTagSection}>
        {channelTags.map((tagName) => (
          <ChannelTag tagName={tagName} key={tagName} />
        ))}
      </div>
      <button className={styles.submit} onclick={() => handleSearch(state, actions)}>
        <div className={styles.submitText}>
          <Icon className={styles.searchIcon} src={searchIcon} size={14} />
          SEARCH
        </div>
        <SearchDetail />
      </button>
    </section>
  )
}
