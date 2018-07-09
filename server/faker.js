const faker = require('faker')
const id = (name) => name + faker.random.uuid()
const flip = (prob = 0.5) => Math.random() < prob
const times = (fn, time) => Array.from(Array(time)).map((_, i) => fn(i))
const sample = (arr, length = 1) => faker.helpers.shuffle(arr).slice(0, length)

const embedMapUrls = [
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7977.611348575816!2d103.7847196!3d1.2909192999999974!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da1a52319edb39%3A0x9a36ad159e134e84!2sKent+Ridge+MRT+Station!5e0!3m2!1sen!2ssg!4v1530772915143',
]

const genWithSaving = (map, gen) => (obj) => {
  const genImpl = () => {
    const data = gen(obj)
    map[data.id] = data
    return data
  }
  if (obj && obj.id) {
    const saved = map[obj.id]
    return saved || genImpl()
  } else {
    return genImpl()
  }
}

const channelMap = {}
const channel = genWithSaving(channelMap, (o) =>
  Object.assign(
    {
      id: id('channel'),
      name: `Channel ${faker.lorem.word()}`,
    },
    o,
  ),
)

const channels = times(channel, 10)

const userMap = {}
const user = genWithSaving(userMap, (o) =>
  Object.assign(
    {
      id: id('user'),
      name: faker.internet.userName(),
      avatarUrl: faker.image.avatar(),
    },
    o,
  )
)

const users = times(user, 20)

const commentMap = {}
const comment = genWithSaving(commentMap, (o) =>
  Object.assign(
    {
      id: id('comment'),
      created: faker.date.recent(),
      author: sample(users)[0],
      content: faker.lorem.lines(2),
      replying: flip(0.2) ? sample(users)[0] : null,
    },
    o,
  )
)

const activityMap = {}
const activity = genWithSaving(activityMap, (o) =>
  Object.assign(
    {
      id: id('activity'),
      channels: sample(channels, flip(0.8) ? 1 : 2),
      title: times(faker.lorem.lines, 2).join(''),
      starter: sample(users)[0],
      publishTime: flip() ? faker.date.past() : faker.date.recent(),
      detail: {
        images: times(
          flip() ? () => faker.image.city() : () => faker.image.nature(),
          sample([2, 3, 4])[0],
        ),
        description: faker.lorem.lines(40),
        leavingTime: faker.date.future(),
        returnTime: faker.date.future(1),
        embedMapUrl: sample(embedMapUrls)[0],
      },
      going: sample(users, sample(times((i) => i + 3, 30))[0]),
      liked: sample(users, sample(times((i) => i + 3, 20))[0]),
      replies: times(comment, sample(times((i) => i + 3, 10))[0]),
    },
    o,
  )
)

module.exports = {
  times,
  activity,
  channel,
  user,
}
