import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'
import '@testing-library/jest-dom'

test('renders content', () => {
  const blog = {
    title: 'Test Blog',
    author: 'Jayan Vi',
    url: 'https://google.com',
    likes: 5,
    user: {
      name: 'Jayan Vi',
      username: 'jayanvi',
    }
  }

  const mockUpdateBlog = vi.fn()
  const mockRemoveBlog = vi.fn()
  render(<Blog blog={blog}  updateBlog={mockUpdateBlog} removeBlog={mockRemoveBlog}/>)

  const element = screen.getByText('Test Blog - Jayan Vi')
  expect(element).toBeDefined()
})

test ('Url and likes are not displayed by default', () => {
  const blog = {
    title: 'Test Blog',
    author: 'Jayan Vi',
    url: 'https://google.com',
    likes: 5,
    user: {
      name: 'Jayan Vi',
      username: 'jayanvi',
    }
  }
  const mockUpdateBlog = vi.fn()
  const mockRemoveBlog = vi.fn()
  render(<Blog blog={blog} updateBlog={mockUpdateBlog} removeBlog={mockRemoveBlog}/>)
  const urlElement = screen.queryByText('https://google.com')
  const likesElement = screen.queryByText('likes 5')

  expect(urlElement).toBeNull()
  expect(likesElement).toBeNull()
})

test('clicking the button shows url and likes', async () => {
  const blog = {
    title: 'Test Blog',
    author: 'Jayan Vi',
    url: 'https://google.com',
    likes: 5,
    user: {
      name: 'Jayan Vi',
      username: 'jayanvi',
    }
  }
  const mockUpdateBlog = vi.fn()
  const mockRemoveBlog = vi.fn()
  render(<Blog blog={blog} updateBlog={mockUpdateBlog} removeBlog={mockRemoveBlog}/>)
  const user = userEvent.setup()
  const button = screen.getByText('view')
  await user.click(button)
  const titleElement = screen.getByText('Test Blog - Jayan Vi')
  const urlElement = screen.getByText('https://google.com')
  const likesElement = screen.getByText('likes 5')
  expect(titleElement).toBeDefined()
  expect(urlElement).toBeDefined()
  expect(likesElement).toBeDefined()
})

test('clicking the like button twice calls updateBlog twice', async () => {
  const blog = {
    title: 'Test Blog',
    author: 'Jayan Vi',
    url: 'https://google.com',
    likes: 5,
    user: {
      name: 'Jayan Vi',
      username: 'jayanvi',
    }
  }
  const mockUpdateBlog = vi.fn()
  const mockRemoveBlog = vi.fn()
  render(<Blog blog={blog} updateBlog={mockUpdateBlog} removeBlog={mockRemoveBlog}/>)
  const user = userEvent.setup()
  const button = screen.getByText('view')
  await user.click(button)
  const likeButton = screen.getByText('like')
  await user.click(likeButton)
  await user.click(likeButton)
  expect(mockUpdateBlog.mock.calls).toHaveLength(2)
  console.log(mockUpdateBlog.mock.calls)
  // Actuallly the likes are not incremented in the mock, so we need to check the calls
  // expect(mockUpdateBlog.mock.calls[0][0].likes).toBe(6)
  // expect(mockUpdateBlog.mock.calls[1][0].likes).toBe(7)
})