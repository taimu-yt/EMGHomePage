import React from 'react';
import Bookmark from './Bookmark'; // Bookmarkコンポーネントをインポート

const BookmarkList = ({ bookmarks }) => {
  return (
    <div>
      {bookmarks.map((bookmark) => (
        <Bookmark key={bookmark.id} bookmark={bookmark} />
      ))}
    </div>
  );
};

export default BookmarkList;