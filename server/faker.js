const faker = require('faker')
const id = (name) => name + '-' + faker.random.uuid()
const flip = (prob = 0.5) => Math.random() < prob
const times = (fn, time) => Array.from(Array(time)).map((_, i) => fn(i))
const sample = (arr, length = 1) => faker.helpers.shuffle(arr).slice(0, length)
const image = (width=480, height=640) => `https://picsum.photos/${width}/${height}?${Math.ceil(Math.random() * 1000)}`

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
      email: faker.internet.email(),
      likeCount: Math.ceil(Math.random() * 10 + 10),
      goCount: Math.ceil(Math.random() * 10 + 10),
      pastCount: Math.ceil(Math.random() * 10 + 10),
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
      created: new Date(faker.date.recent()).getTime(),
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
          flip() ? () => image(180, 100) : () => image(180, 100),
          sample([3, 4, 5])[0],
        ),
        description: faker.lorem.lines(40),
        leavingTime: faker.date.future(),
        returnTime: faker.date.future(1),
        embedMapUrl: sample(embedMapUrls)[0],
        address: {
          firstLine: faker.address.streetName(3),
          secondLine: faker.address.secondaryAddress(2) + ' S1234151',
        },
      },
      meGoing: false,
      meLiking: false,
      going: sample(users, sample(times((i) => i + 3, 30))[0]),
      liked: sample(users, sample(times((i) => i + 3, 20))[0]),
      // comments: times(comment, sample(times((i) => i + 3, 10))[0]),
      comments: times(comment, 30),
    },
    o,
  )
)

module.exports = {
  times,
  activity,
  channel,
  comment,
  user,
}
