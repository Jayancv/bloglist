const { test, expect, describe, beforeEach }  = require("@playwright/test")
const {login, logout, createBlog, createUser} = require("./helper")
const { log } = require("console")

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001'

describe("Blogs App", () => {
  beforeEach(async ({ page, request }) => {
    await request.post(BASE_URL + "/api/testing/reset", {
      data: {},
    })
    await createUser(request,  {
        name: "Test E2E User",
        username: "testuser",
        password: "testpassword",
    })
    await page.goto(BASE_URL)
  })

  test("should display the login form", async ({ page }) => {
    // await page.goto(BASE_URL)
    await expect(
      page.getByRole("heading", { name: "Log in to application" })
    ).toBeVisible()
    await expect(page.getByText("username")).toBeVisible()
    await expect(page.getByText("password")).toBeVisible()
    await expect(page.getByRole("button", { name: "login" })).toBeVisible()
  })

  test("should log in with valid credentials", async ({ page }) => {
    await page.fill('input[name="Username"]', "testuser")
    await page.fill('input[name="Password"]', "testpassword")
    await page.click('button[type="submit"]')

    // Check if the user is redirected to the blogs page
    await expect(page.getByRole("heading", { name: "Blogs" })).toBeVisible()
    await expect(page.getByText("Test E2E User logged in")).toBeVisible()
  })

  test("Login with invalid credentials", async ({ page }) => {
    await page.fill('input[name="Username"]', "testuser")
    await page.fill('input[name="Password"]', "wrongpassword")
    await page.click('button[type="submit"]')

    // Check if the error message is displayed
    await expect(page.getByText("Wrong username or password")).toBeVisible()
  })
})

describe("When logged in", () => {
    beforeEach(async ({ page, request }) => {
      await request.post(BASE_URL + "/api/testing/reset", {
        data: {},
      });
      await createUser(request, {
        name: "Test E2E User",
        username: "testuser",
        password: "testpassword",
      });

      await page.goto(BASE_URL);
      await login(page, "testuser", "testpassword");
    });


    test("a new blog can be created", async ({ page }) => {

        await page.click('button:has-text("Create New Blog")')
        await expect(page.getByRole("heading", { name: "Create New Blog" })).toBeVisible()

        await page.fill('input[name="title"]', "E2E Test Blog")
        await page.fill('input[name="author"]', "E2E Test Author")
        await page.fill('input[name="url"]', "http://example.com/e2e-test-blog")
        await page.click('button[type="submit"]')

        // Check if the new blog is displayed in the list
        await expect(page.getByText("E2E Test Blog - E2E Test Author")).toBeVisible()

    })

    test("a blog can be liked", async ({ page }) => {
        await createBlog(page, {
            title: "E2E Test Blog",
            author: "E2E Test Author",
            url: "http://example.com/e2e-test-blog"
        })

        await expect(page.getByText("E2E Test Blog - E2E Test Author")).toBeVisible()
        await page.click('button:has-text("view")')
        await page.click('button:has-text("like")')

        const likeCount = await page.getByText("likes 1").textContent()

    })

    test("a blog can be removed by the creator", async ({ page }) => {
        await createBlog(page, {
            title: "E2E Test Blog", 
            author: "E2E Test Author",
            url: "http://example.com/e2e-test-blog"
        })

        await expect(page.getByText("E2E Test Blog - E2E Test Author")).toBeVisible()
        await page.click('button:has-text("view")')
        await page.on('dialog', async (dialog) => {
            expect(dialog.message()).toBe("Remove blog E2E Test Blog by E2E Test Author?")
            await dialog.accept()   
        })
        await page.click('button:has-text("Remove")')
        
        await expect(page.getByText("E2E Test Blog - E2E Test Author")).not.toBeVisible()
    })

    test("removing a blog does not show the remove button for other users", async ({ page, request }) => {
        await createBlog(page, {
            title: "E2E Test Blog", 
            author: "E2E Test Author",
            url: "http://example.com/e2e-test-blog"
        })
        await expect(page.getByText("E2E Test Blog - E2E Test Author")).toBeVisible()
        await page.click('button:has-text("view")')
        await expect(page.getByRole("button", { name: "Remove" })).toBeVisible()

        await logout(page)
        await createUser(request, {
            name: "E2E User2",
            username: "testuser2",
            password: "testpassword2",
        })
        await login(page, "testuser2", "testpassword2")
        await expect(page.getByText("E2E Test Blog - E2E Test Author")).toBeVisible()
        await page.click('button:has-text("view")') 
        await expect(page.getByRole("button", { name: "Remove" })).not.toBeVisible()
            
    })

    test("blogs are ordered by likes", async ({ page }) => {
        await createBlog(page, {
            title: "Blog 1",
            author: "Author 1",
            url: "http://example.com/blog1"
        })
        await createBlog(page, { 
            title: "Blog 2",
            author: "Author 2",
            url: "http://example.com/blog2"
        })
        await createBlog(page, {
            title: "Blog 3",
            author: "Author 3",
            url: "http://example.com/blog3"
        })
        await expect(page.getByText("Blog 1 - Author 1")).toBeVisible()
        await expect(page.getByText("Blog 2 - Author 2")).toBeVisible()
        await expect(page.getByText("Blog 3 - Author 3")).toBeVisible()

        
        // Click the "view" button for "Blog 3 - Author 3"
        await page.getByText('Blog 3 - Author 3').locator('..').getByRole('button', { name: 'view' }).click()
        await page.getByText('Blog 3 - Author 3').locator('..').getByRole('button', { name: 'like' }).click()
        await page.getByText('Blog 3 - Author 3').locator('..').getByRole('button', { name: 'like' }).click()
        await page.getByText('Blog 3 - Author 3').locator('..').getByRole('button', { name: 'like' }).click()
        await page.getByText('Blog 3 - Author 3').locator('..').getByRole('button', { name: 'like' }).click()

        // Click the "view" button for "Blog 1 - Author 1"
        await page.getByText('Blog 1 - Author 1').locator('..').getByRole('button', { name: 'view' }).click()
        await page.getByText('Blog 1 - Author 1').locator('..').getByRole('button', { name: 'like' }).click()
        await page.getByText('Blog 1 - Author 1').locator('..').getByRole('button', { name: 'like' }).click()
        await page.getByText('Blog 1 - Author 1').locator('..').getByRole('button', { name: 'like' }).click()

        // Click the "view" button for "Blog 2 - Author 2"
        await page.getByText('Blog 2 - Author 2').locator('..').getByRole('button', { name: 'view' }).click()
        await page.getByText('Blog 2 - Author 2').locator('..').getByRole('button', { name: 'like' }).click()
    

        // Check if the blogs are ordered by likes
        const blogTitles = await page.locator('.blogTitle').allTextContents()
        log("Blog titles:", blogTitles)
        const blogTexts = blogTitles
        expect(blogTexts[0]).toContain("Blog 3 - Author 3")
        expect(blogTexts[1]).toContain("Blog 1 - Author 1")
        expect(blogTexts[2]).toContain("Blog 2 - Author 2")
    })


})
