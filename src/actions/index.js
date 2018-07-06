import { merge, mergeIds } from '../helpers/state'
import { location } from '../../router'

export default {
  location: location.actions,
  updateActivities: (activities) => (state) => {
    return {
      activityMap: merge(state.activityMap, activities),
    }
  },
  searchActivitiesSuccess: (activities, mode = 'append') => (state) => {
    return {
      searchActivityIds: mergeIds(state.searchActivityIds, activities, mode),
    }
  },
}
