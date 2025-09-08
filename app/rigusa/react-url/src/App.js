import { useState, useRef } from 'react';
import BookmarkList from './BookmarkList';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [bookmarks, setBookmarks] = useState([]);
  const bookmarkNameRef = useRef();
  const bookmarkUrlRef = useRef();

  const handleAddBookmark = () => {
    const name = bookmarkNameRef.current.value;
    const url = bookmarkUrlRef.current.value;
    if (name === '' || url === '') return;

    setBookmarks((prevBookmarks) => {
      return [...prevBookmarks, { id: uuidv4(), name: name, url: url }];
    });

    bookmarkNameRef.current.value = null;
    bookmarkUrlRef.current.value = null;
  };

  return (
    <div>
      
      <BookmarkList bookmarks={bookmarks} />
      
      <input type='text' ref={bookmarkNameRef} placeholder="名前" />
      <input type='text' ref={bookmarkUrlRef} placeholder="URL" />
      
      <button onClick={handleAddBookmark}>追加</button>
      
      <div>ブックマークの数: {bookmarks.length}</div>
    </div>
  );
}

export default App;