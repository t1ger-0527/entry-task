import once from 'once'
import { merge, mergeIds } from '../helpers/state'
import { location } from '../../router'
import { defaultDetailPageState } from '../state'

const fetchSelf = () => () =>
  fetch('http://10.22.203.174:2333/me', { credentials: 'include' })
    .then((res) => res.json())
    .then((self) => ({ self }))
    .catch(() => ({ self: null }))
const fetchSelfOnce = once(fetchSelf)

export default {
  location: location.actions,
  updateActivities: (activities) => (state) => {
    return {
      activityMap: merge(state.activityMap, activities),
    }
  },
  searchActivitiesSuccess: (activities, mode = 'append') => (state) => {
    return {
      searchingActivities: false,
      searchActivityIds: mergeIds(state.searchActivityIds, activities, mode),
    }
  },
  startSearchActivities: (mode) => (state) => ({
    searchingActivities: true,
    searchActivityIds: mode === 'replace' ? [] : state.searchActivityIds,
  }),
  fetchSelf,
  fetchSelfOnce,
  resetDetailPage: () => ({
    detailPage: defaultDetailPageState,
  }),
  detailPage: {
    expandDescription: () => () => ({ isTruncated: false }),
    toggleCommenting: (e) => (state) => {
      if (e && e.preventDefault) {
        e.preventDefault()
      }
      return {
        commenting: !state.commenting,
        replyingTo: state.commenting ? null : state.replyingTo,
      }
    },
    updateNavActiveIndex: (index) => ({ navActiveIndex: index }),
    toggleReplying: (replyTo) => ({ replyingTo }) => ({
      replyingTo: replyingTo && replyingTo.id === replyTo.id ? null : replyTo,
      commenting: true,
    }),
    expandUserList: (key) => ({ userListsExpanded }) => ({
      userListsExpanded: {
        ...userListsExpanded,
        [key]: true,
      },
    }),
  },
  locationChanged: () => (state) => {
    // global location change hook.
    return {
      isSidePanelActive: false,
    }
  },
  toggleSidePanel: (onOff) => (state) => {
    if (onOff == null) {
      onOff = !state.isSidePanelActive
    }
    if (onOff) {
      Object.assign(document.documentElement.style, {
        overflow: 'hidden',
      })
    } else {
      Object.assign(document.documentElement.style, {
        overflow: 'initial',
      })
    }
    return {
      isSidePanelActive: onOff,
    }
  },
  searchPanel: {
    toggleDateTag: (tagName) => (state) => {
      if (state.activeDateTag === tagName || tagName === 'ANYTIME') {
        return {
          activeDateTag: null,
        }
      }
      return {
        activeDateTag: tagName,
      }
    },
    toggleChannelTag: (tagName) => (state) => {
      const {activeChannelTags} = state
      const index = activeChannelTags.findIndex(t => t === tagName)
      if (tagName === 'All') {
        return {activeChannelTags: []}
      } else if (index !== -1) {
        activeChannelTags.splice(index, 1)
      } else {
        activeChannelTags.push(tagName)
      }
      return {
        activeChannelTags
      }
    },
    reset: () => ({
      activeDateTag: null,
      activeChannelTags: [],
    })
  },
}

export function performActionOnActivity(activity, actionName, actions, event) {
  if (event && event.preventDefault) {
    event.preventDefault()
  }
  fetch(`http://10.22.203.174:2333/activities/${activity.id}`, {
    method: 'PUT',
    body: JSON.stringify({ [actionName]: !activity[actionName] }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(
    actions.updateActivities({
      id: activity.id,
      [actionName]: !activity[actionName],
    }),
  )
}
