import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  href: string;
  description?: string;
}

export function StatsCard({ title, value, icon: Icon, href, description }: StatsCardProps) {
  return (
    <Link
      href={href}
      className="block overflow-hidden rounded-lg bg-white shadow transition-shadow hover:shadow-md"
    >
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-8 w-8 text-gray-400" aria-hidden="true" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="truncate text-sm font-medium text-gray-500">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value.toLocaleString()}</div>
              </dd>
              {description && (
                <dd className="mt-1 text-sm text-gray-500">{description}</dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </Link>
  );
}
