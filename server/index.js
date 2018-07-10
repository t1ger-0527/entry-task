const express = require('express')
const bodyParser = require('body-parser')
const { activity, times, user } = require('./faker')

const app = express()

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin
  const allowedHeaders = req.headers['access-control-request-headers'] || ''

  res.setHeader('Access-Control-Allow-Origin', requestOrigin)
  if (allowedHeaders) {
    res.setHeader('Access-Control-Request-Headers', allowedHeaders)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PUT')
  next()
})

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('healthy')
})

app.get('/activities', (req, res) => {
  res.send({
    data: times(activity, 6),
    paging: {
      next: '/activities',
      is_end: false,
    }
  })
})

app.get('/activities/:id', (req, res) => {
  res.send(activity({id: req.params.id}))
})

app.put('/activities/:id', (req, res) => {
  const theActivity = activity({id: req.params.id})
  Object.assign(theActivity, req.body)
  res.send(theActivity)
})

app.get('/me', (req, res) => {
  // TODO: impl the login.
  res.send(user({id: 'me'}))
})

app.listen(2333)
console.log('Server running on 2333')
