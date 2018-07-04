import once from "once";
import { app, h } from "../hyperapp-impl";

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
  return emojiList
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
        actions.search("");
      });
  }
};

const EmojiItem = emoji => (
  <li>
    {emoji.symbol} {emoji.title}
  </li>
);

const EmojiList = emojis => {
  const list = emojis.map(emoji => <EmojiItem {...emoji} />);
  return <ul>{list.length ? list : <li>No matches</li>}</ul>;
};

const view = (state, actions) => (
  <div class="container">
    <h1>Emoji Search</h1>
    <input
      type="search"
      placeholder="Search..."
      oninput={e => actions.search(e.target.value || "")}
    />
    <EmojiList {...state.filteredEmoji} />
  </div>
);

const { getEmojiList, search } = app(
  state,
  actions,
  view,
  document.documentElement
);
getEmojiList().then(() => search("Jo"));
