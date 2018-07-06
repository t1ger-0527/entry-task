import { merge, mergeIds } from '../helpers/state'

export default {
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
