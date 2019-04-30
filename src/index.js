const axios = require('axios')

module.exports = ({ required, fetchUser }) => {
  return async (req, res, next) => {
    let token = req.headers['x-access-token'] // Extract token
    if (token) {
      // Verify token
      let userId
      try {
        let response = await axios({
          url: 'http://api-gateway:3001/user/auth',
          method: 'get',
          headers: { 'x-access-token': token },
          responseType: 'json'
        })
        userId = response.data
      } catch(err) {
        if (err.response.status === 401 && required) return res.sendStatus(401) // Invalid token and it's required
        else if (err.response.status === 401 && !required) next() // Invalid token but not required, so move on
      }

      console.log(userId)

      // Check if fetchUser is true
      if (fetchUser) {
        try {
          let response = await axios({
            url: `http://api-gateway:3001/user/${userId}`,
            method: 'get',
            responseType: 'json'
          })
          req.user = response.data
        } catch (err) {
          return res.sendStatus(err.response.status)
        }
      } else { // If not, set req.user to user ID
        req.user = userId
      }
    } else if (required) return res.sendStatus(401) // no token and not required, move on
    next()
  }
}