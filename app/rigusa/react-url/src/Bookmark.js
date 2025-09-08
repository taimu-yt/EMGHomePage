import React from 'react';

const Bookmark = ({ bookmark }) => {
  return (
    <div>
      <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
        {bookmark.name}
      </a>
    </div>
  );
};

export default Bookmark;