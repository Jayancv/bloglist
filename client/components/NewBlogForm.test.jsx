import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewBlogForm from './NewBlogForm'


test('NewBlogForm updates parent state and calls onSubmit', async () => {

  const mockCreateBlog = vi.fn()
  const user = userEvent.setup()

  const { container } = render(<NewBlogForm handleSubmit={mockCreateBlog} />)

  const titleInput = container.querySelector('#title')
  const authorInput = container.querySelector('#author')
  const urlInput = container.querySelector('#url')
  const sendButton = screen.getByText('Create')

  //   console.log(user);
  //   console.log(titleInput)

  await user.type(titleInput, 'Blog Title')
  await user.type(authorInput, 'Author Name')
  await user.type(urlInput, 'http://google.com')
  await user.click(sendButton)

  console.log(mockCreateBlog.mock.calls)

  expect(mockCreateBlog.mock.calls).toHaveLength(1)
  expect(mockCreateBlog.mock.calls[0][0].title).toBe('Blog Title')
  expect(mockCreateBlog.mock.calls[0][0].author).toBe('Author Name')
  expect(mockCreateBlog.mock.calls[0][0].url).toBe('http://google.com')
})