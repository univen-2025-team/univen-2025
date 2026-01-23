import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import Image from 'next/image'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

// Mapping badge ID to image filename
const badgeImageMap: Record<string, string> = {
  'first-trade': 'TheInitiate',
  'top-10': 'ProfilePro',
  'top-3': 'DiamondHand',
  'champion': 'BearFighter',
  'profit-1m': 'GreenDay',
  'profit-10m': 'TheStraategist',
  'profit-100m': 'BearFighter',
  'active-trader': 'NightOwl',
  'risk-master': 'Diversifier',
}

interface BadgeCardProps {
  badgeId: string
  name: string
  description: string
  earned: boolean
  earnedDate?: string
  progress?: number
  requirement: string
  className?: string
}

function BadgeCard({
  badgeId,
  name,
  description,
  earned,
  earnedDate,
  progress,
  requirement,
  className,
}: BadgeCardProps) {
  const imageName = badgeImageMap[badgeId] || 'TheInitiate'
  const imagePath = `/Badges/${imageName}.png`

  return (
    <div
      className={cn(
        'relative bg-white rounded-lg p-5 transition-all duration-200 overflow-hidden',
        earned
          ? 'hover:shadow-md '
          : 'border-gray-200 opacity-70 hover:opacity-90',
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Badge Image */}
        <div
          className={cn(
            'relative shrink-0 rounded-lg overflow-hidden w-20 h-20',
            // earned
            //   ? 'ring-2 ring-[#2D5BDE]/30 bg-[#F0F4FF]'
            //   : 'bg-gray-100 border border-gray-200'
          )}
        >
          <Image
            src={imagePath}
            alt={name}
            width={100}
            height={100}
            className={cn(
              'w-full h-full object-cover',
              !earned && 'grayscale opacity-50'
            )}
          />
        </div>

        {/* Badge Info */}
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            'text-base font-bold mb-1',
            earned ? 'text-[#2D3748]' : 'text-[#718096]'
          )}>
            {name}
          </h3>
          <p className={cn(
            'text-sm mb-2 leading-relaxed line-clamp-2',
            earned ? 'text-[#718096]' : 'text-[#A0AEC0]'
          )}>
            {description}
          </p>

          {earned ? (
            <>
              <p className="text-xs text-[#718096] mb-2">
                Đạt được:{' '}
                <span className="font-semibold text-[#2D5BDE]">
                  {earnedDate
                    ? new Date(earnedDate).toLocaleDateString('vi-VN')
                    : '—'}
                </span>
              </p>
            </>
          ) : (
            <>
              <p className="text-xs text-[#A0AEC0] mb-2">
                Yêu cầu: <span className="font-medium text-[#718096]">{requirement}</span>
              </p>
              {progress !== undefined && progress > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[#718096] font-medium">Tiến độ</span>
                    <span className="text-[#2D5BDE] font-semibold">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                    <div
                      className="h-full transition-all duration-500 rounded-full bg-gradient-to-r from-[#2D5BDE] to-[#5B7FE8]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export { Badge, badgeVariants, BadgeCard, badgeImageMap }
