import { useRef } from 'react'
import Blog from './Blog'
import Logout from './Logout'
import NewBlogForm from './NewBlogForm'
import Notification from '../components/Notification'
import Togglable from './Togglable'
import blogService from '../services/blogs'

const BlogDetails = ({
  blogs,
  setBlogs,
  user,
  setUser,
  notification,
  setNotification,
}) => {
  const newBlogFormRef = useRef()

  const handleCreateBlog = async (blog) => {
    try {
      const newBlog = await blogService.create(blog)
      console.log('New blog created:', newBlog)
      newBlog.user = {
        name: user.name,
        username: user.username,
      }
      setBlogs(blogs.concat(newBlog))
      setNotification({
        error: 0,
        message: `A new blog '${newBlog.title}' by ${newBlog.author} added`,
      })
      setTimeout(() => {
        setNotification({ error: 0, message: null })
      }, 5000)
      newBlogFormRef.current.toggleVisibility() // Hide the form after submission

    } catch (error) {
      console.error('Error creating blog:', error)
      setNotification({
        error: 1,
        message: 'Failed to create blog. Please try again.',
      })
      setTimeout(() => {
        setNotification({ error: 0, message: null })
      }, 5000)
    }
  }

  const updateBlog = (blog) => {
    blogService
      .update(blog.id, { ...blog, user: blog.user.id })
      .then((updatedBlog) => {
        console.log('Blog updated successfully:', updatedBlog)
        setBlogs(
          blogs.map((b) =>
            b.id !== blog.id ? b : { ...b, likes: updatedBlog.likes }
          )
        )
      })
      .catch((error) => {
        console.error('Error updating blog:', error)
        alert('Failed to update likes. Please try again.')
      })
  }

  const removeBlog = (blog) => {
    blogService
      .remove(blog.id)
      .then(() => {
        console.log(`Blog ${blog.title} removed successfully`)
        setBlogs(
          blogs
            .map((b) => (b.id !== blog.id ? b : null))
            .filter((b) => b !== null)
        )
      })
      .catch((error) => {
        console.error('Error removing blog:', error)
        alert(
          'Failed to remove blog. Please try again.'
        )
        setNotification({
          error: 1,
          message: `Failed to remove blog: ${
            error.response && error.response.data && error.response.data.error
              ? error.response.data.error
              : error.message || 'Unknown error'
          }`,
        })
        setTimeout(() => {
          setNotification({ error: 0, message: null })
        }, 5000)
      })
  }

  return (
    <div>
      <h2>Blogs</h2>
      <Notification error={notification.error} message={notification.message} />
      <p>
        {user.name} logged in
        <Logout setUser={setUser} />
      </p>
      <br />
      <Togglable buttonLabel='Create New Blog' ref={newBlogFormRef}>
        <NewBlogForm handleSubmit={handleCreateBlog} />
      </Togglable>
      <br />
      {blogs
        .sort((a, b) => b.likes - a.likes)
        .map((blog) => (
          <Blog
            key={blog.id}
            blog={blog}
            updateBlog={updateBlog}
            removeBlog={removeBlog}
          />
        ))}
    </div>
  )
}

export default BlogDetails
