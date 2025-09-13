import React from 'react';

// 引数の {} を一つにまとめる
const Bookmark = ({ bookmark, handleDeleteBookmark }) => {
  
  const handleDeleteClick = () => {
    handleDeleteBookmark(bookmark.id);
  };

  return (
    <div>
      <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
        {bookmark.name}
      </a>
      <button onClick={handleDeleteClick} style={{ marginLeft: '10px' }}>削除</button>
    </div>
  );
};

export default Bookmark;