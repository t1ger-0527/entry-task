const express = require('express')
const {activity, times} = require('./faker')

const app = express()

app.get('/', (req, res) => {
  res.send('healthy')
})

app.get('/activities', (req, res) => {
  res.send(times(activity, 6))
})

app.listen(2333)
console.log('Server running on 2333')
