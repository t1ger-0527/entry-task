import {format} from 'date-fns'
export const toTimeText = (timestamp) => {
  const d = new Date(timestamp)
  return format(d, 'D MMM YYYY HH:mm')
}