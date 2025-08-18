'use client';

import { useEffect, useState } from 'react';
import { getAllPosts, getAllCategories, getAllTags } from '@/lib/blog';
import BlogDisplayCards from '@/components/blog/blog-display-cards';

// This is a special debug page to test the display cards without authentication
export default function DebugDisplayCards() {
  const [mounted, setMounted] = useState(false);
  const posts = getAllPosts({});
  
  useEffect(() => {
    setMounted(true);
    console.log('Debug page loaded with posts:', posts);
    console.log('Categories:', getAllCategories());
    console.log('Tags:', getAllTags());
  }, [posts]);

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Debug: Display Cards</h1>
      
      <div className="max-w-5xl mx-auto bg-card p-6 rounded-lg shadow-sm border">
        <h2 className="text-2xl font-bold mb-4">Blog Display Cards</h2>
        <p className="mb-8 text-muted-foreground">
          This is a special page to test the display cards component without authentication.
          You should see 3 stacked cards below with different categories.
        </p>
        
        {mounted && posts.length > 0 ? (
          <BlogDisplayCards posts={posts} />
        ) : (
          <div className="h-[400px] w-full bg-muted/20 animate-pulse rounded-lg"></div>
        )}
        
        {mounted && (
          <div className="mt-8 p-4 bg-muted/50 rounded-md">
            <h3 className="font-medium mb-2">Debug Information</h3>
            <pre className="text-xs overflow-auto p-2 bg-background rounded border">
              {JSON.stringify({
                postsCount: posts.length,
                postTitles: posts.map(post => post.frontmatter.title),
                categories: getAllCategories(),
                tags: getAllTags()
              }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}