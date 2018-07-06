export default {
  state: {
    pathname: window.location.pathname,
  },
  actions: {
    go: (pathname) => {
      // pushState here is a monkey-patched pushState
      window.history.pushState(null, '', pathname)
    },
    set: (data) => console.log('data', data) || data,
  },

  // call subscribe to initiate the hijack of history.
  subscribe: (actions) => {
    const handleLocationChange = (e) => {
      console.log('event: ', e)
      actions.set({
        pathname: window.location.pathname,
      })
    }

    // monkey-patch the history API
    // so we can get noticed when pathname changed from outside.
    ;['pushState', 'popState'].map((key) => {
      const originalFn = history[key]
      window.history[key] = function(...args) {
        console.log('key: ', key)
        const [data, title, url] = args
        originalFn.call(this, data, title, url)
        window.dispatchEvent(new CustomEvent(key, { detail: data }))
      }
    })

    window.addEventListener('pushState', handleLocationChange)
    window.addEventListener('popstate', handleLocationChange)
  },
}
