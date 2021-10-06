const axios = require('axios')

async function auth (authorization) {
  try {
    return (await axios.post(`${process.env.API_AUTH_HOST}/auth`, {
      authorization
    })).data.content.auth
  } catch (error) {
    return null
  }
}

module.exports = {
  auth
}
