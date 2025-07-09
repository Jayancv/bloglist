import blogService from '../services/blogs'

const Logout = ({ setUser }) => {
  const handleLogout = () => {
    setUser(null)
    blogService.setToken(null)
    window.localStorage.removeItem('loggedBlogappUser')
  }

  return <button onClick={handleLogout}>Logout</button>
}

export default Logout
