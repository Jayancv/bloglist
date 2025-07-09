const dummy = () => {
  // The dummy function is a placeholder that returns 1
  // regardless of the input, simulating a simple test case.
  return 1
}

const totalLikes = (blogs) => {
  // The totalLikes function calculates the total number of likes
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  // The favoriteBlog function finds the blog with the most likes
  if (blogs.length === 0) return null
  return blogs.reduce(
    (max, blog) => (blog.likes > max.likes ? blog : max),
    blogs[0]
  )
}

const mostBlogs = (blogs) => {
  // The mostBlogs function finds the author with the most blogs
  if (blogs.length === 0) return null
  const authorCount = blogs.reduce((count, blog) => {
    count[blog.author] = (count[blog.author] || 0) + 1
    return count
  }, {})
  const mostBlogsAuthor = Object.keys(authorCount).reduce(
    (max, author) => (authorCount[author] > authorCount[max] ? author : max),
    Object.keys(authorCount)[0]
  )
  return {
    author: mostBlogsAuthor,
    blogs: authorCount[mostBlogsAuthor],
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null
  const authorLikes = blogs.reduce((likes, blog) => {
    likes[blog.author] = (likes[blog.author] || 0) + blog.likes
    return likes
  }, {})
  const mostLikesAuthor = Object.keys(authorLikes).reduce(
    (max, author) => (authorLikes[author] > authorLikes[max] ? author : max),
    Object.keys(authorLikes)[0]
  )
  return {
    author: mostLikesAuthor,
    likes: authorLikes[mostLikesAuthor],
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
