import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useRef, useEffect } from 'react';
import BookmarkList from './BookmarkList';
import { v4 as uuidv4 } from 'uuid';
import './App.css';


const API_URL = 'http://localhost:3001/api/bookmarks';

function App() {
  const [bookmarks, setBookmarks] = useState([]);
  const bookmarkNameRef = useRef();
  const bookmarkUrlRef = useRef();

  useEffect(() => {
    fetch(API_URL)
    .then(res => res.json())
    .then(data => setBookmarks(data));
  }, [])

  const handleAddBookmark = () => {
    const name = bookmarkNameRef.current.value;
    const url = bookmarkUrlRef.current.value;
    if (name === '' || url === '') return;

    const newBookmarks = {id: uuidv4(), name, url: url};

    fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newBookmarks),
    })
    .then(res => res.json())
    .then(addedBookmark => {
      setBookmarks((prevBookmarks) => [...prevBookmarks, addedBookmark]);
    });

    bookmarkNameRef.current.value = null;
    bookmarkUrlRef.current.value = null;
    };

  const handleDeleteBookmark = (id) => {

    fetch(`http://localhost:3001/api/bookmarks/${id}`,{
      method: 'DELETE',
    })
    .then(res => {
      if(!res.ok){
        throw new Error('responded error')
      }
      return res.json();
    })

    .then(() => {
      const newBookmarks = bookmarks.filter((bookmark) => bookmark.id !== id);
    setBookmarks(newBookmarks);
    })

    .catch(error => {
      console.error("Failed to delete bookmark:", error);
      alert("削除に失敗しました。");
    });
  };

  return (
    <div className='app-style'>
      
      <BookmarkList bookmarks={bookmarks} handleDeleteBookmark={handleDeleteBookmark} />

      <input type='text' ref={bookmarkNameRef} placeholder="名前" />
      <input type='text' ref={bookmarkUrlRef} placeholder="URL" />
      
      <button onClick={handleAddBookmark}>追加</button>
      
      <div>ブックマークの数: {bookmarks.length}</div>
    </div>
  );
}

export default App;