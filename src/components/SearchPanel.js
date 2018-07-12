import { format } from 'date-fns'
import cx from 'classnames'
import { h } from '../../framework'
import Icon from './Icon'
import fromIcon from '../icons/date-from.svg'
import toIcon from '../icons/date-to.svg'
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

export const getSearchText = (state) => {
  const { activeChannelTags, activeDateTag, dateFields } = state.searchPanel
  if (!activeDateTag && activeChannelTags.length === 0) return 'All activities'
  const channelSearchText =
    activeChannelTags.length > 0
      ? activeChannelTags.join(' & ') + ' activities '
      : ''
  let dateSearchText
  if (activeDateTag === 'LATER') {
    dateSearchText = `from ${format(dateFields.from, 'DD/MM')} to ${format(
      dateFields.to,
      'DD/MM',
    )}`
  } else {
    dateSearchText = activeDateTag ? activeDateTag.toLowerCase() : 'any time.'
  }
  let searchText
  if (!channelSearchText) {
    searchText = `Activities at ${dateSearchText}`
  } else {
    searchText = `${channelSearchText}${dateSearchText}`
  }
  return searchText
}

const SearchDetail = () => (state) => {
  const searchText = getSearchText(state)
  return <div className={styles.searchText}>{searchText}</div>
}

export const getSearchQueryFromState = (state) =>
  `d=${state.searchPanel.activeDateTag ||
    ''}&c=${state.searchPanel.activeChannelTags.join(',')}`

const handleSearch = (state, actions) => {
  actions.toggleSidePanel(false)
  const query = getSearchQueryFromState(state)
  actions.startSearchActivities('replace')
  actions.updateCurrentSearching(null)
  fetch(`http://10.22.203.174:2333/activities?${query}`)
    .then((res) => res.json())
    .then(({ data: activities }) => {
      actions.updateActivities(activities)
      actions.searchActivitiesSuccess(activities, 'replace')
      actions.updateCurrentSearching({
        ...state.searchPanel,
        resultCount: Math.ceil(Math.random()) * 90 + 50,
      })
    })
}

export default () => (state, actions) => {
  const { activeDateTag, dateFields } = state.searchPanel
  return (
    <section className={styles.root} ondestroy={actions.searchPanel.reset}>
      <div className={styles.sectionTitle}>DATE</div>
      <div className={styles.dateTagSection}>
        {dateTags.map((tagName) => <DateTag tagName={tagName} key={tagName} />)}
      </div>
      {activeDateTag === 'LATER' && (
        <div className={styles.dateInputContainer}>
          <Icon src={fromIcon} width={12} height={10} topOffset={-1} />
          <div className={styles.fakeDateInput}>
            {format(dateFields.from, 'DD/MM/YYYY')}
            <input
              onchange={(e) =>
                actions.searchPanel.changeSearchDateField(
                  'from',
                  new Date(e.target.value),
                )
              }
              value={format(dateFields.from, 'YYYY-MM-DD')}
              className={styles.dateInput}
              type="date"
            />
          </div>
          <span className={styles.dateSeperator} />
          <Icon src={toIcon} width={12} height={10} topOffset={-1} />
          <div className={styles.fakeDateInput}>
            {format(dateFields.to, 'DD/MM/YYYY')}
            <input
              onchange={(e) =>
                actions.searchPanel.changeSearchDateField(
                  'to',
                  new Date(e.target.value),
                )
              }
              value={format(dateFields.to, 'YYYY-MM-DD')}
              className={styles.dateInput}
              type="date"
            />
          </div>
        </div>
      )}
      <div className={cx(styles.sectionTitle, styles.secondChannel)}>
        CHANNEL
      </div>
      <div className={styles.channelTagSection}>
        {channelTags.map((tagName) => (
          <ChannelTag tagName={tagName} key={tagName} />
        ))}
      </div>
      <button
        className={styles.submit}
        onclick={() => handleSearch(state, actions)}
      >
        <div className={styles.submitText}>
          <Icon className={styles.searchIcon} src={searchIcon} size={14} />
          SEARCH
        </div>
        <SearchDetail />
      </button>
    </section>
  )
}
