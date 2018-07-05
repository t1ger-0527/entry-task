import { merge, mergeIds } from '../helpers/state'

export default {
  updateActivities: (activities) => (state) => {
    return {
      ...state,
      activityMap: merge(state.activityMap, activities),
    }
  },
  searchActivities: (activities) => (state) => {
    return {
      ...state,
      // TODO: ends here
    }
  },
}
