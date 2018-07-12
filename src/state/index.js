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
  isSidePanelActive: false,
}

export default {
  location: location.state,
  activityMap: {},
  searchActivityIds: [],
  self: null,
  searchingActivities: false,
  detailNavActiveIndex: 0,
  detailPage: defaultDetailPageState,
  searchPanel: {
    activeDateTag: null,
    activeChannelTags: [],
  }
}
