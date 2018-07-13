import cx from 'classnames'
import { h } from '../framework'
import matchRoutes from './matchRoute'

const Link = (props, children) => (state, actions) => {
  const originalClickHandler = props.onclick

  const clickHandler = (e) => {
    if (originalClickHandler) originalClickHandler()

    // @see https://github.com/hyperapp/router/blob/master/src/Link.js#L27
    if (
      e.defaultPrevented ||
      // if opening with other than left click (main click), we do nothing.
      // about MouseEvent.prototype.button:
      // @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
      e.button !== 0 ||
      // if any key is pressed when we hit the link, we do nothing
      e.altKey ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      // if opening in another tab, we do nothing.
      props.target === '_blank'
    ) {
      // do nothing
    } else {
      // prevent the hard-routing.
      e.preventDefault()

      // we only pushState when we jump to a different route.
      if (props.to !== window.location.pathname) {
        window.history.pushState(window.location.pathname, '', props.to)
      }
    }
  }
  const match = matchRoutes(props.to, window.location.pathname)
  const additionalClassNames = props.activeClassName ? {
    [props.activeClassName]: match,
  } : null
  if (props.render) {
    children = props.render(match)
  }
  return (
    <a
      {...props}
      className={cx(props.className, additionalClassNames)}
      active={!!match}
      onclick={clickHandler}
    >
      {children}
    </a>
  )
}

export default Link
