import loginService from '../services/login'
import blogService from '../services/blogs'
import Notification from './Notification'

const LoginForm = ({
  username, setUsername,
  password, setPassword,
  setUser,
  notification, setNotification,
}) => {
  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({ username, password })
      setUser(user)
      setUsername('')
      setPassword('')
      blogService.setToken(user.token)
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
      setNotification({
        error: 0,
        message: `Welcome back, ${user.name}!`,
      })
      setTimeout(() => {
        setNotification({ error: 0, message: null })
      }, 5000)

    } catch (exception) {
      console.error('Login failed:', exception)
      setUsername('')
      setPassword('')
      setNotification({
        error: 1,
        message: 'Wrong username or password',
      })
      setTimeout(() => {
        setNotification({ error: 0, message: null })
      }, 5000)
    }
  }

  return (
    <div>
      <Notification error={notification.error} message={notification.message} />
      <br />
      <h2>Log in to application</h2>
      <form onSubmit={handleLogin}>
        <div>
          username
          <input type='text' name='Username' value={username} onChange={({ target }) => setUsername(target.value)}/>
        </div>
        <div>
          password
          <input type='password' name='Password' value={password} onChange={({ target }) => setPassword(target.value)}/>
        </div>
        <button type='Submit'>Login</button>
      </form>
    </div>
  )
}

export default LoginForm
