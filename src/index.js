const axios = require('axios')

module.exports = ({ required }) => {
  return async (req, res, next) => {
    let token = req.headers['x-access-token'] // Extract token
    if (token) {
      // Verify token
      try {
        let response = await axios({
          url: 'http://api-gateway:3001/user/auth',
          method: 'get',
          headers: { 'x-access-token': token },
          responseType: 'json'
        })

        if (response.status === 200) req.user = response.data
      } catch(error) {
        if (error.response.status === 401 && required) return res.sendStatus(401) // Invalid token and it's required
        else if (error.response.status === 401 && !required) next() // Invalid token but not required, so move on
      }
    } else if (required) return res.sendStatus(401) // no token and not required, move on
    next()
  }
}