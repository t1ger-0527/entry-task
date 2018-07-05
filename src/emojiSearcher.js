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
  return result;
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
        return { filteredEmoji: filterEmoji("", 20) };
      });
  }
};

const updateHandler = (...args) => console.log('UPDATED:', ...args)

const EmojiItem = emoji => (
  <li key={emoji.title} onupdate={updateHandler}>
    {emoji.symbol} {emoji.title}
  </li>
);

const EmojiList = emojis => {
  const list = emojis.map(emoji => <EmojiItem {...emoji} />);
  return <ul>{list.length ? list : <li>No matches</li>}</ul>;
};

const view = (state, actions) => (
  <div
    class="container"
    oncreate={actions.getEmojiList}
    onupdate={updateHandler}
  >
    <h1>Emoji Search {state.filteredEmoji.length}</h1>
    <input
      type="search"
      placeholder="Search..."
      oninput={e => actions.search(e.target.value || "")}
    />
    <EmojiList {...state.filteredEmoji} />
  </div>
);

app(state, actions, view, document.documentElement);

/**
 * the markdown app.
 */
// import marked from 'marked'
// import Mousetrap from 'mousetrap'
//
// const state = {
//   source: ""
// };
//
// const actions = {
//   update: source => state => ({ source }),
//
//   save: textarea => (state, actions) => {
//     paintFlash(textarea, "springgreen", 0.25);
//     localStorage.setItem("source", state.source);
//   },
//
//   delete: textarea => (state, actions) => {
//     localStorage.setItem("source", "");
//     localStorage.clear();
//     actions.setSourceFromStorage();
//     textarea.value = "";
//
//     paintFlash(textarea, "pink", 0.25);
//   },
//
//   setSourceFromStorage: () => {
//     if (localStorage.getItem("source")) {
//       return state => ({ source: localStorage.getItem("source") });
//     } else {
//       return state => ({ source: "" });
//     }
//   },
//
//   shortcuts: textarea => (state, actions) => {
//     Mousetrap.bind(["ctrl+s", "command+s"], e => {
//       actions.save(textarea);
//       e.preventDefault();
//     });
//
//     Mousetrap.bind(["ctrl+q", "command+q"], e => {
//       actions.delete(textarea);
//       e.preventDefault();
//     });
//   }
// };
//
// const paintFlash = (element, color, seconds) => {
//   element.style.transition = `background-color ${seconds / 2}s ease-in-out`;
//   element.style.backgroundColor = color;
//   setTimeout(() => {
//     element.style.backgroundColor = "";
//   }, seconds * 1000);
// };
//
// const dangerouslySetInnerHTML = html => element => {
//   element.innerHTML = html;
// };
//
// const compile = source =>
//   dangerouslySetInnerHTML(marked(source, { sanitize: true }));
//
// const view = (state, actions) => (
//   <div class="main">
//     <div class="col editor">
//       <textarea
//         oninput={e => actions.update(e.target.value)}
//         oncreate={element => {
//           actions.shortcuts(element);
//           // e.focus(); // remove for codepen
//         }}
//         className="mousetrap"
//       >
//         {state.source}
//       </textarea>
//     </div>
//     <div
//       className="col preview"
//       oncreate={compile(state.source)}
//       onupdate={compile(state.source)}
//     />
//   </div>
// );
//
// window.main = app(state, actions, view, document.documentElement);
