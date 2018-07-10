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
}
