const axios = require('axios')

function auth(authorization) {
  return new Promise(function (resolve, reject) {
    axios.post(process.env.AUTH_API_HOST, {}, {
      headers: {
        Authorization: authorization
      }
    })
      .then(function (response) {
        resolve(response.data.data.user);
      })
      .catch(function (error) {
        reject(null)
      })
  })
}

module.exports = {
  auth
}
