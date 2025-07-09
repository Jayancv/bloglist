import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import LoginForm from './components/LoginForm'
import Logout from './components/Logout'
import BlogDetails from './components/BlogDetails'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState({ error: 0, message: null })

  useEffect(() => {
    blogService.getAll().then((blogs) => setBlogs(blogs))
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  return (
    <div>
      {user === null ? (
        <LoginForm
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          setUser={setUser}
          notification={notification}
          setNotification={setNotification}
        />
      ) : (
        <BlogDetails
          blogs={blogs}
          setBlogs={setBlogs}
          user={user}
          setUser={setUser}
          notification={notification}
          setNotification={setNotification}
        />
      )}
    </div>
  )
}

export default App
