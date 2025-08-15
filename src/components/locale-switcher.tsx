"use client";

import * as React from "react";
import { Globe } from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// 语言显示映射
const localeLabels: Record<string, string> = {
  en: "English",
  zh: "中文",
};

// 语言标志（简单使用文本，也可以用国旗emoji或SVG）
const localeFlags: Record<string, string> = {
  en: "🇬🇧",
  zh: "🇨🇳",
};

export function LocaleSwitcher() {
  const { locale, setLocale } = useTranslations();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLocale("en")} className={locale === "en" ? "bg-muted" : ""}>
          <span className="mr-2">{localeFlags.en}</span>
          <span>English</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale("zh")} className={locale === "zh" ? "bg-muted" : ""}>
          <span className="mr-2">{localeFlags.zh}</span>
          <span>中文</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}