import once from 'once'
import { merge, mergeIds } from '../helpers/state'
import { location } from '../../router'

const fetchSelf = () => () =>
  fetch('http://localhost:2333/me', { credentials: 'include' })
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
  startSearchActivities: () => (state) => ({
    searchingActivities: true,
  }),
  fetchSelf,
  fetchSelfOnce,
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
  },
}

export function performActionOnActivity(activity, actionName, actions, event) {
  if (event && event.preventDefault) {
    event.preventDefault()
  }
  fetch(`http://localhost:2333/activities/${activity.id}`, {
    method: 'PUT',
    body: JSON.stringify({ [actionName]: !activity[actionName] }),
  }).then(
    actions.updateActivities({
      id: activity.id,
      [actionName]: !activity[actionName],
    }),
  )
}
