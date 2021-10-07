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
function getUser(userId, authorization) {
  console.log('authorization',authorization)
  return new Promise(function (resolve, reject) {
    axios.get(`${process.env.USERS_API_HOST}users/${userId}`, {}, {
      headers: {
        Authorization: authorization
      }
    })
      .then(function (response) {
        console.log(response)
        resolve(response.data.data.user);
      })
      .catch(function (error) {
        console.log('error',error.response)
        reject(null)
      })
  })
}

module.exports = {
  auth,
  getUser
}
