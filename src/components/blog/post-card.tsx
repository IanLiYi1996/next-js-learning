'use client';

import React from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/blog-utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PostCardProps {
  slug: string;
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  category?: string;
  className?: string;
}

const PostCard: React.FC<PostCardProps> = ({
  slug,
  title,
  date,
  description,
  tags,
  category,
  className,
}) => {
  return (
    <Link href={`/blog/${slug}`} className="block h-full">
      <Card className={cn("h-full hover:shadow-md transition-all duration-200 border border-muted", className)}>
        <CardHeader>
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm text-muted-foreground">
              {formatDate(date)}
            </div>
            {category && (
              <Badge variant="secondary" className="capitalize">
                {category}
              </Badge>
            )}
          </div>
          <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {description && (
            <p className="text-muted-foreground line-clamp-3 text-sm">
              {description}
            </p>
          )}
        </CardContent>
        {tags && tags.length > 0 && (
          <CardFooter>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
};

export default PostCard;