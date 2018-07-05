import { app, h } from "../hyperapp-impl";

// const state = {
//   count: 0
// }
//
// const actions = {
//   down: value => state => console.log(value) || ({ count: state.count - value }),
//   up: value => state => console.log(value) || ({ count: state.count + value })
// }
//
// const view = (state, actions) => (
//   <div>
//     <h1>{state.count}</h1>
//     <button onclick={() => actions.down(1)}>-</button>
//     <button onclick={() => actions.up(1)}>+</button>
//   </div>
// )
//
// app(state, actions, view, document.body)
/**
 * Default Emoji List
 * The complete list will be fetched from a JSON file when main container is created
 */
let emojiList = [
  {
    symbol: "⏳",
    title: "Loading..."
  }
];

const filterEmoji = (searchText, maxResults) => {
  const result = emojiList
    .filter(emoji => {
      if (emoji.title.toLowerCase().includes(searchText.toLowerCase())) {
        return true;
      }

      if (emoji.keywords.includes(searchText)) {
        return true;
      }

      return false;
    })
    .slice(0, maxResults);
  return result
};

const state = {
  filteredEmoji: filterEmoji("", 20)
};

const actions = {
  search: text => ({ filteredEmoji: filterEmoji(text, 20) }),
  getEmojiList: () => (state, actions) => {
    return fetch(
      "https://raw.githubusercontent.com/ahfarmer/emoji-search/master/src/emojiList.json"
    )
      .then(data => data.json())
      .then(data => {
        emojiList = data;
        return {filteredEmoji: filterEmoji('', 20)}
      });
  }
};

const EmojiItem = emoji => (
  <li key={emoji.title}>
    {emoji.symbol} {emoji.title}
  </li>
);

const EmojiList = emojis => {
  const list = emojis.map(emoji => <EmojiItem {...emoji} />);
  return <ul>{list.length ? list : <li>No matches</li>}</ul>;
};

const view = (state, actions) => (
  <div class="container">
    <h1>Emoji Search {state.filteredEmoji.length}</h1>
    <input
      type="search"
      placeholder="Search..."
      oninput={e => actions.search(e.target.value || "")}
    />
    <EmojiList {...state.filteredEmoji} />
  </div>
);

const { getEmojiList } = app(
  state,
  actions,
  view,
  document.documentElement
);
getEmojiList()
