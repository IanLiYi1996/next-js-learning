import matter from 'gray-matter';
import { format, parseISO } from 'date-fns';
import { Post, PostFrontmatter, BLOG_POSTS } from './blog-data';

/**
 * 获取所有博客文章的slug
 */
export function getPostSlugs(): string[] {
  return Object.keys(BLOG_POSTS);
}

/**
 * 根据slug获取单篇博客文章
 */
export function getPostBySlug(slug: string): Post {
  // 获取文章内容
  const post = BLOG_POSTS[slug];
  
  if (!post) {
    throw new Error(`博客文章 "${slug}" 未找到`);
  }
  
  // 使用gray-matter解析frontmatter和内容
  const { data, content } = matter(post.content);
  
  // 返回格式化的数据
  return {
    slug,
    frontmatter: data as PostFrontmatter,
    content,
  };
}

/**
 * 获取所有博客文章
 * @param tag 可选的标签过滤
 * @param category 可选的分类过滤
 */
export function getAllPosts({
  tag,
  category,
}: {
  tag?: string;
  category?: string;
} = {}): Post[] {
  const slugs = getPostSlugs();
  let posts = slugs
    .map((slug) => getPostBySlug(slug))
    // 按日期降序排序（最新的在前面）
    .sort((post1, post2) => {
      const date1 = new Date(post1.frontmatter.date);
      const date2 = new Date(post2.frontmatter.date);
      return date2.getTime() - date1.getTime();
    });
  
  // 如果提供了标签，则过滤
  if (tag) {
    posts = posts.filter(post => 
      post.frontmatter.tags?.includes(tag)
    );
  }
  
  // 如果提供了分类，则过滤
  if (category) {
    posts = posts.filter(post => 
      post.frontmatter.category === category
    );
  }
  
  return posts;
}

/**
 * 获取所有分类
 */
export function getAllCategories(): string[] {
  const posts = getAllPosts();
  const categoriesSet = new Set<string>();
  
  posts.forEach(post => {
    if (post.frontmatter.category) {
      categoriesSet.add(post.frontmatter.category);
    }
  });
  
  return Array.from(categoriesSet);
}

/**
 * 获取所有标签
 */
export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tagsSet = new Set<string>();
  
  posts.forEach(post => {
    if (post.frontmatter.tags) {
      post.frontmatter.tags.forEach(tag => tagsSet.add(tag));
    }
  });
  
  return Array.from(tagsSet);
}

/**
 * 格式化日期
 */
export function formatDate(date: string): string {
  const parsedDate = parseISO(date);
  return format(parsedDate, 'yyyy年MM月dd日');
}

/**
 * 从markdown内容中提取标题，用于生成目录
 */
export function extractHeadings(content: string): Array<{
  level: number;
  text: string;
  slug: string;
}> {
  // 匹配 ## 标题、### 标题 等格式
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const headings = [];
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length; // # 的数量，表示标题级别
    const text = match[2];         // 标题文本
    
    // 创建用于锚点的slug（将标题转为短横线分隔的小写形式）
    // 例如 "## 我的标题" -> "我的标题"
    const slug = text
      .toLowerCase()
      .replace(/\s+/g, '-')      // 空格替换为短横线
      .replace(/[^\w\u4e00-\u9fa5-]/g, '') // 移除非单词、非中文字符
      .replace(/--+/g, '-');     // 多个短横线替换为单个
    
    headings.push({ level, text, slug });
  }
  
  return headings;
}