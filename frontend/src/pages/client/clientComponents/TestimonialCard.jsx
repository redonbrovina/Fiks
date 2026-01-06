import React from 'react';

// We pass 'quote', 'author', and 'image' as props to make it reusable
const TestimonialCard = ({ quote, author, image }) => {
  return (
    <div className="flex items-center gap-5 p-8 bg-white rounded-sm shadow-sm">
      {/* Avatar Circle */}
      <div className="flex-shrink-0 w-20 h-20 overflow-hidden bg-gray-300 rounded-full">
        {image ? (
          <img src={image} alt={author} className="object-cover w-full h-full" />
        ) : (
          <div className="w-full h-full bg-gray-300" /> // Placeholder if no image
        )}
      </div>

      {/* Content */}
      <div className="text-left">
        <p className="text-lg font-bold text-black leading-tight mb-1">
          {quote}
        </p>
        <p className="text-sm text-gray-500">
          - {author}
        </p>
      </div>
    </div>
  );
};

export default TestimonialCard;