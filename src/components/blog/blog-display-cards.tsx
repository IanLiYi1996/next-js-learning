"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DisplayCard } from "@/components/ui/display-cards";
import { Post } from "@/lib/blog-data";
import { BookOpen, Tag, Calendar, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Directly format date without using hooks
function formatDateSimple(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (e) {
    return dateStr;
  }
}

// Custom icons for different categories
const getCategoryIcon = (category?: string) => {
  switch (category?.toLowerCase()) {
    case "教程":
      return <BookOpen className="size-4 text-blue-300" />;
    case "技巧":
      return <Tag className="size-4 text-green-300" />;
    case "新闻":
      return <Calendar className="size-4 text-orange-300" />;
    default:
      return <Sparkles className="size-4 text-blue-300" />;
  }
};

// Get appropriate colors based on category
const getCategoryColors = (category?: string) => {
  switch (category?.toLowerCase()) {
    case "教程":
      return {
        icon: "bg-blue-800",
        title: "text-blue-500",
      };
    case "技巧":
      return {
        icon: "bg-green-800",
        title: "text-green-500",
      };
    case "新闻":
      return {
        icon: "bg-orange-800",
        title: "text-orange-500",
      };
    default:
      return {
        icon: "bg-blue-800",
        title: "text-blue-500",
      };
  }
};

// Default placeholder posts in case we have fewer than 3 real posts
const PLACEHOLDER_POSTS = [
  {
    slug: "placeholder-1",
    frontmatter: {
      title: "精彩文章即将推出",
      date: new Date().toISOString(),
      description: "敬请期待更多精彩内容",
      category: "教程",
    },
  },
  {
    slug: "placeholder-2",
    frontmatter: {
      title: "技术专题系列",
      date: new Date().toISOString(),
      description: "探索最新的技术趋势和解决方案",
      category: "技巧",
    },
  },
  {
    slug: "placeholder-3",
    frontmatter: {
      title: "行业新闻",
      date: new Date().toISOString(),
      description: "了解行业最新动态和信息",
      category: "新闻",
    },
  },
];

interface BlogDisplayCardsProps {
  posts: Post[];
  className?: string;
}

export default function BlogDisplayCards({ posts, className }: BlogDisplayCardsProps) {
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Ensure we have 3 posts by combining real posts with placeholders if needed
  const ensureThreePosts = () => {
    if (posts.length >= 3) {
      return posts.slice(0, 3); // Only use the first 3 real posts
    }
    
    // Fill with placeholders as needed
    const placeholdersNeeded = 3 - posts.length;
    return [
      ...posts,
      ...PLACEHOLDER_POSTS.slice(0, placeholdersNeeded)
    ];
  };

  // Get 3 posts to display
  const displayPosts = ensureThreePosts();

  // Move useEffect after all other hooks and before any conditional logic
  useEffect(() => {
    setMounted(true);
    console.log("BlogDisplayCards mounted with", posts.length, "posts");
  }, [posts.length]);

  // Generate cards configuration from posts
  const cards = displayPosts.map((post, index) => {
    const { icon, title } = getCategoryColors(post.frontmatter.category);
    
    // Different styling based on card position in stack
    let cardClassName = "";
    if (index === 0) {
      cardClassName = "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0";
    } else if (index === 1) {
      cardClassName = "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0 md:translate-x-16 sm:translate-x-8 xs:translate-x-4";
    } else {
      cardClassName = "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10 md:translate-x-32 sm:translate-x-16 xs:translate-x-8";
    }

    // Add active class when hovered
    if (hoveredCard === post.slug) {
      cardClassName = cn(cardClassName, "before:opacity-0 grayscale-0 z-10");
    }

    return {
      title: post.frontmatter.title,
      description: post.frontmatter.description || "阅读更多...",
      date: formatDateSimple(post.frontmatter.date),
      icon: getCategoryIcon(post.frontmatter.category),
      iconClassName: icon,
      titleClassName: title,
      className: cardClassName,
      slug: post.slug,
      isPlaceholder: post.slug.startsWith("placeholder-"),
    };
  });

  // Prepare the loading state component for SSR
  const loadingComponent = (
    <div className="h-[400px] w-full bg-muted/20 animate-pulse rounded-lg"></div>
  );

  // Prepare the loaded component
  const loadedComponent = (
    <div className={cn("relative w-full py-8", className)}>
      <h2 className="text-2xl font-bold mb-12 text-center">精选文章</h2>
      
      {/* Desktop view */}
      <div className="hidden md:grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700">
        {cards.map((card, index) => (
          <Link 
            key={index} 
            href={card.isPlaceholder ? "#" : `/blog/${card.slug}`}
            onMouseEnter={() => setHoveredCard(card.slug)}
            onMouseLeave={() => setHoveredCard(null)}
            className="block"
          >
            <DisplayCard
              title={card.title}
              description={card.description}
              date={card.date}
              icon={card.icon}
              iconClassName={card.iconClassName}
              titleClassName={card.titleClassName}
              className={card.className}
            />
          </Link>
        ))}
      </div>

      {/* Mobile view - single column stack */}
      <div className="md:hidden space-y-4">
        {displayPosts.map((post, index) => {
          const { icon, title } = getCategoryColors(post.frontmatter.category);
          const isPlaceholder = post.slug.startsWith("placeholder-");
          
          return (
            <Link 
              key={index} 
              href={isPlaceholder ? "#" : `/blog/${post.slug}`}
              className={cn("block", isPlaceholder && "opacity-70")}
            >
              <DisplayCard
                title={post.frontmatter.title}
                description={post.frontmatter.description || "阅读更多..."}
                date={formatDateSimple(post.frontmatter.date)}
                icon={getCategoryIcon(post.frontmatter.category)}
                iconClassName={icon}
                titleClassName={title}
                className="w-full skew-y-0 hover:scale-105 transition-transform"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );

  // Return the appropriate component based on mounted state
  // This ensures hooks are called in the same order every render
  return mounted ? loadedComponent : loadingComponent;
}