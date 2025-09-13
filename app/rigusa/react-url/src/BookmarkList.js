import React from 'react';
import Bookmark from './Bookmark'; // Bookmarkコンポーネントをインポート

const BookmarkList = ({ bookmarks, handleDeleteBookmark }) => {
  return (
    <div>
      {bookmarks.map((bookmark) => (
        <Bookmark key={bookmark.id} bookmark={bookmark}
          handleDeleteBookmark={handleDeleteBookmark}/>
      ))}
    </div>
  );
};

export default BookmarkList;