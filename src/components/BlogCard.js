import React from "react";
import { Link } from "react-router-dom";

const BlogCard = ({ post }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:transform hover:scale-102">
      <div className="relative">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-56 object-cover"
        />
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-purple-600 text-sm font-medium rounded-full">
            {post.category}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center mb-3">
          <span className="text-sm text-gray-500">{post.readTime}</span>
          <span className="mx-2 text-gray-300">•</span>
          <span className="text-sm text-gray-500">
            {new Date(post.date).toLocaleDateString()}
          </span>
        </div>
        <h2 className="text-xl font-bold mb-3 text-gray-800 hover:text-purple-600 transition-colors duration-200">
          <Link to={`/blog/${post.id}`}>{post.title}</Link>
        </h2>
        <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-medium">
              {post.author
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{post.author}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-purple-50 text-purple-600 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
