import once from 'once'
import { merge, mergeIds } from '../helpers/state'
import { location } from '../../router'
import { defaultDetailPageState } from '../state'
import { getSearchQueryFromState } from '../components/SearchPanel'

const fetchSelf = () => () =>
  fetch('http://10.22.203.174:2333/me', { credentials: 'include' })
    .then((res) => res.json())
    .then((self) => ({ self }))
    .catch(() => ({ self: null }))
const fetchSelfOnce = once(fetchSelf)

export default {
  location: location.actions,
  updateActivities: (activities) => (state, actions) => {
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
    toggleCommenting: (commenting) => (state) => {
      if (commenting == null) {
        commenting = !state.commenting
      }
      return {
        commenting,
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
      Object.assign(document.body.style, {
        overflow: 'hidden',
      })
    } else {
      Object.assign(document.documentElement.style, {
        overflow: 'initial',
      })
      Object.assign(document.body.style, {
        overflow: 'initial',
      })
    }
    return {
      isSidePanelActive: onOff,
    }
  },
  updateUserMap: (users) => (state, actions) => {
    return {
      userMap: merge(state.userMap, users),
    }
  },
  fetchUser: (userId) => (state, actions) => {
    fetch(`http://10.22.203.174:2333/users/${userId}`)
      .then((res) => res.json())
      .then((user) => actions.updateUserMap(user))
  },
  searchPanel: {
    toggleDateTag: (tagName) => (state, actions) => {
      if (state.activeDateTag === tagName || tagName === 'ANYTIME') {
        return {
          activeDateTag: null,
        }
      }
      if (tagName === 'LATER') {
        return {
          activeDateTag: 'LATER',
          dateFields: {
            from: Date.now(),
            to: Date.now(),
          },
        }
      } else {
        return {
          activeDateTag: tagName,
          dateFields: null,
        }
      }
    },
    changeSearchDateField: (field, value) => (state) => {
      return {
        dateFields: {
          ...state.dateFields,
          [field]: value,
        },
      }
    },
    toggleChannelTag: (tagName) => (state) => {
      const { activeChannelTags } = state
      const index = activeChannelTags.findIndex((t) => t === tagName)
      if (tagName === 'All') {
        return { activeChannelTags: [] }
      } else if (index !== -1) {
        activeChannelTags.splice(index, 1)
      } else {
        activeChannelTags.push(tagName)
      }
      return {
        activeChannelTags,
      }
    },
    reset: () => ({
      activeDateTag: null,
      activeChannelTags: [],
    }),
  },
  updateCurrentSearching: (currentSearching) => (state) => {
    return {
      currentSearching,
    }
  },
  fetchActivity: (mode) => (state, actions) => {
    const query = getSearchQueryFromState(state)
    actions.startSearchActivities(mode)
    fetch(`http://10.22.203.174:2333/activities?${query}`)
      .then((res) => res.json())
      .then(({ data: activities }) => {
        actions.updateActivities(activities)
        actions.searchActivitiesSuccess(activities, mode)
        activities = Array.isArray(activities) ? activities : [activities]
        actions.updateUserMap(activities.map((a) => a.starter))
        actions.updateUserMap(activities.reduce((users, activity) => {
          return users.concat(activity.comments.map(c => c.author))
        },[]))
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
