import {location} from '../../router'

export const defaultDetailPageState = {
  isTruncated: true,
  navActiveIndex: 0,
  commenting: false,
  replyingTo: null,
  userListsExpanded: {
    going: false,
    liked: false,
  },
}

export const defaultSearchPanelState = {
  activeDateTag: null,
  activeChannelTags: [],
  dateFields: {
    from: Date.now(),
    to: Date.now(),
  }
}

export default {
  location: location.state,
  activityMap: {},
  searchActivityIds: [],
  self: null,
  searchingActivities: false,
  detailNavActiveIndex: 0,
  detailPage: defaultDetailPageState,
  searchPanel: defaultSearchPanelState,
  currentSearching: null,
  isSidePanelActive: false,
}
