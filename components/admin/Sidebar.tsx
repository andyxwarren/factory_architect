'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Settings,
  Users,
  ShoppingBag,
  FileText,
  GitMerge,
  Wand2,
  CheckSquare,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Difficulty Parameters', href: '/admin/difficulty-parameters', icon: Settings },
  { name: 'Characters', href: '/admin/characters', icon: Users },
  { name: 'Items', href: '/admin/items', icon: ShoppingBag },
  { name: 'Scenario Templates', href: '/admin/scenario-templates', icon: FileText },
  { name: 'Curated Mappings', href: '/admin/curated-mappings', icon: GitMerge },
  { name: 'Generate Questions', href: '/admin/generate', icon: Wand2 },
  { name: 'Approval Queue', href: '/admin/approval-queue', icon: CheckSquare },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <h1 className="text-xl font-bold text-gray-900">Factory Architect</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={classNames(
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors'
              )}
            >
              <Icon
                className={classNames(
                  isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600',
                  'mr-3 h-5 w-5 flex-shrink-0'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="text-xs text-gray-500">
          <p className="font-medium">Admin CMS</p>
          <p className="mt-1">No auth required (development)</p>
        </div>
      </div>
    </div>
  );
}
