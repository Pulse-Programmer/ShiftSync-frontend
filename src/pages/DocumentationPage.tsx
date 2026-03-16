import { Link } from 'react-router-dom';
import { Clock, ArrowLeft } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ThemeSwitcher } from '../components/ui/ThemeSwitcher';
import readmeContent from '../../README.md?raw';

export function DocumentationPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-bg/80 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text transition-colors"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Back to login</span>
            </Link>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                <Clock size={12} className="text-text-inverse" />
              </div>
              <span className="font-display font-bold text-text text-sm tracking-tight">
                ShiftSync
              </span>
            </div>
          </div>
          <ThemeSwitcher />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="prose">
            <Markdown remarkPlugins={[remarkGfm]}>{readmeContent}</Markdown>
          </div>
        </div>
      </div>
    </div>
  );
}
