const BASE_URL = process.env.BASE_URL || 'http://localhost:3001'

const login = async (page, username, password) => {
  await page.fill('input[name="Username"]', username)
  await page.fill('input[name="Password"]', password)
  await page.click('button[type="submit"]')
}

const logout = async (page) => {
  await page.click('button:has-text("Logout")')
}   


const createBlog = async (page, blog) => {
  await page.click('button:has-text("Create New Blog")')
  await page.fill('input[name="title"]', blog.title)
  await page.fill('input[name="author"]', blog.author)
  await page.fill('input[name="url"]', blog.url)
  await page.click('button[type="submit"]')
  await page.getByText(`${blog.title} - ${blog.author}`).waitFor({ state: 'visible' })

    
}  

const createUser = async (request ,user) => {
  await request.post(BASE_URL+"/api/users", {
      data: {
        name: user.name,
        username: user.username,
        password:user.password,
      },
    })  

}

module.exports = {
  login, logout, createBlog, createUser
}
