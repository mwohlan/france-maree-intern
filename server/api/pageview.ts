const startAt = Date.now()
let count = 0

export default defineEventHandler(async (event) => {
  useBody(event)
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve('done')
    }, 2000)
  })
  return {
    pageview: count++,
    startAt,
  }
},
)
