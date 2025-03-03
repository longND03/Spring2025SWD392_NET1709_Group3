import { useState } from "react";

const Blog = () => {
    const [posts, setPosts] = useState([]);
    


    return (
        <>

            <div className="relative h-[30vh] overflow-hidden">
                <img src="/images/blog_banner.jpg" alt="Blog banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 text-center text-white flex flex-col items-center justify-center">
                    <p className="text-5xl md:text-6xl font-bold mb-6">Blog</p>
                    <p className="text-lg md:text-xl mt-2 max-w-md">
                        Discover the latest in skincare—new products, exclusive sales, beauty tips, and updates from our store.
                    </p>
                </div>

            </div>

            <div className="text-center text-5xl md:text-6xl font-bold mb-6">hihi</div>

        </>
    );
}

export default Blog;