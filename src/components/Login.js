import cx from 'classnames'
import { h } from '../../framework'
import logoCat from '../icons/logo-cat.svg'
import userIcon from '../icons/user.svg'
import passwordIcon from '../icons/password.svg'
import Icon from './Icon'
import styles from './Login.css'

const handleLoginFormSubmit = (actions, e) => {
  e.preventDefault()
  const data = {}
  const formElements = Array.from(e.target.elements)
  formElements
    .filter((e) => e.nodeName === 'INPUT')
    .map((e) => (data[e.name] = e.value))
  fetch('http://localhost:2333/login', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  })
    .then(() => actions.fetchSelf())
}

export default () => (state, actions) => {
  return (
    <div className={styles.root}>
      <div className={styles.mask} />
      <div className={styles.content}>
        <h2 className={styles.slogan}>FIND THE MOST LOVED ACTIVITIES</h2>
        <h1 className={styles.title}>BLACK CAT</h1>
        <div className={styles.logoContainer}>
          <Icon src={logoCat} size={45} />
        </div>
        <form
          className={styles.form}
          onsubmit={(e) => handleLoginFormSubmit(actions, e)}
        >
          <div
            className={cx(styles.inputContainer, styles.accountInputContainer)}
          >
            <input
              type="email"
              name="email"
              placeholder="Email"
              className={styles.input}
            />
            <Icon className={styles.inputIcon} src={userIcon} size={13.3} />
          </div>
          <div
            className={cx(styles.inputContainer, styles.passwordInputContainer)}
          >
            <input
              type="password"
              name="password"
              placeholder="Password"
              className={styles.input}
            />
            <Icon className={styles.inputIcon} src={passwordIcon} size={13.3} />
          </div>
          <button className={styles.button} type="submit">
            SIGN IN
          </button>
        </form>
      </div>
    </div>
  )
}
