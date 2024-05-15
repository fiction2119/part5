const {
  test,
  expect,
  beforeEach,
  describe,
  afterAll,
} = require("@playwright/test")
const faker = require("faker")

async function loginUser(page, username, password) {
  try {
    await page.fill('[data-testid="username"]', username)
    await page.fill('[data-testid="password"]', password)
    await page.hover('[data-testid="login-button"]')
    await page.click('[data-testid="login-button"]')

    await page.waitForTimeout(1000)
  } catch (error) {
    console.error(`Failed to log in as ${username}:`, error)
    throw error
  }
}

async function createBlog(page, title, author, url) {
  await page.click('[data-testid="add-blog"]')
  await page.fill('[data-testid="title"]', title)
  await page.fill('[data-testid="author"]', author)
  await page.fill('[data-testid="url"]', url)
  await page.click('[data-testid="create-blog-button"]')

  await page.waitForTimeout(1000)
}

function handleDialog(page) {
  page.on("dialog", async (dialog) => {
    if (dialog.type() === "confirm") {
      await dialog.accept()
    } else {
      await dialog.dismiss()
    }
  })
}

describe("Blog app", () => {
  let username

  beforeEach(async ({ page, request }) => {
    await request.post("http://localhost:3003/api/testing/reset")
    await page.waitForTimeout(1000)

    username = faker.internet.userName()
    await request.post("http://localhost:3003/api/users", {
      data: {
        name: faker.name.findName(),
        username: "root",
        password: "sekret",
      },
    })
    await request.post("http://localhost:3003/api/users", {
      data: {
        name: faker.name.findName(),
        username: username,
        password: "salainen",
      },
    })

    await page.waitForTimeout(1000)

    await page.goto("http://localhost:5173")
  })

  test("Login form is shown", async ({ page }) => {
    await expect(page.getByTestId("username")).toBeVisible()
    await expect(page.getByTestId("password")).toBeVisible()
  })

  describe("When logging in...", () => {
    test("login succeeds with correct credentials", async ({ page }) => {
      await loginUser(page, username, "salainen")
      await expect(page.getByTestId("logout-button")).toBeVisible()
    })

    test("login fails with wrong credentials", async ({ page }) => {
      await loginUser(page, username, "wrong")
      await expect(page.getByTestId("login-button")).toBeVisible()
    })
  })

  describe("When user is logged in...", () => {
    beforeEach(async ({ page }) => {
      await loginUser(page, username, "salainen")
    })

    test("A blog can be created", async ({ page }) => {
      await createBlog(
        page,
        "A new blog",
        "Matti Luukkainen",
        "https://fullstackopen.com/en/part4/testing_the_backend"
      )
      const blogAdded = page.getByTestId("notification-id")
      await expect(blogAdded).toContainText("Blog added successfully")
    })

    test("A blog can be liked", async ({ page }) => {
      await createBlog(
        page,
        "A new blog",
        "Matti Luukkainen",
        "https://fullstackopen.com/en/part4/testing_the_backend"
      )
      await page.click('[data-testid="view-blog"]')
      await page.click('[data-testid="like-blog"]')
      const blog = page.getByTestId("likes-id")
      await expect(blog).toContainText("Likes: 1")
    })

    test("A blog can be deleted", async ({ page }) => {
      handleDialog(page)
      await createBlog(
        page,
        "A new blog",
        "Matti Luukkainen",
        "https://fullstackopen.com/en/part4/testing_the_backend"
      )
      await page.click('[data-testid="view-blog"]')
      await page.click('[data-testid="delete-blog"]')
      await expect(page.locator('[data-testid="blog-id"]')).not.toBeVisible()
    })

    test("Only the user who created a blog can see the delete button", async ({
      page,
    }) => {
      await createBlog(
        page,
        "A new blog",
        "Matti Luukkainen",
        "https://fullstackopen.com/en/part4/testing_the_backend"
      )
      await page.click('[data-testid="logout-button"]')

      await page.waitForTimeout(1000)
      await loginUser(page, "root", "sekret")
      await page.click('[data-testid="view-blog"]')
      await expect(
        page.locator('[data-testid="delete-blog"]')
      ).not.toBeVisible()
    })

    test("Blogs are ordered according to likes", async ({ page }) => {
      await createBlog(
        page,
        "A new blog",
        "Matti Luukkainen",
        "https://fullstackopen.com/en/part4/testing_the_backend"
      )
      await createBlog(
        page,
        "Another blog",
        "Matti Luukkainen",
        "https://fullstackopen.com/en/part4/testing_the_backend"
      )
      await createBlog(
        page,
        "Yet another blog",
        "Matti Luukkainen",
        "https://fullstackopen.com/en/part4/testing_the_backend"
      )

      const viewButtons = page.locator('[data-testid="view-blog"]')

      await viewButtons.nth(0).click('[data-testid="view-blog"] button')
      for (let i = 0; i < 3; i++) {
        await page.click('[data-testid="like-blog"]')
        await page.waitForTimeout(1000)
      }

      await viewButtons.nth(1).click('[data-testid="view-blog"] button')
      let likeButtons = page.locator('[data-testid="like-blog"]')

      for (let i = 0; i < 4; i++) {
        await likeButtons.nth(1).click('[data-testid="like-blog"]')
        await page.waitForTimeout(1000)
      }

      await viewButtons.nth(2).click('[data-testid="view-blog"] button')

      const blogs = page.locator('[data-testid="blog-div"]')

      const numberOfLikes = await blogs
        .locator('[data-testid="likes-id"]')
        .allTextContents()

      const processedLikes = numberOfLikes.map((text) =>
        text.replace(" Like", "")
      )

      expect(processedLikes).toEqual(["Likes: 4", "Likes: 3", "Likes: 0"])
    })

    afterAll(async ({ request }) => {
      await request.post("http://localhost:3003/api/testing/reset")
    })
  })
})
