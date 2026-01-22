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
        'relative rounded-2xl p-6 shadow-lg transition-all duration-500 overflow-hidden',
        earned
          ? 'hover:shadow-[0_0_40px_rgba(0,255,255,0.4),0_0_80px_rgba(138,43,226,0.3)] hover:scale-[1.03] hover:-translate-y-1'
          : 'opacity-50 hover:opacity-60',
        className
      )}
      style={{
        background: earned
          ? 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 30%, #16213e 60%, #0f1419 100%)'
          : 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
        border: earned
          ? '2px solid transparent'
          : '1px solid rgba(100, 100, 120, 0.2)',
        boxShadow: earned
          ? '0 0 30px rgba(0, 255, 255, 0.4), 0 0 60px rgba(138, 43, 226, 0.3), 0 0 90px rgba(138, 43, 226, 0.15), inset 0 0 30px rgba(0, 0, 0, 0.6), inset 0 0 60px rgba(0, 255, 255, 0.05)'
          : '0 4px 6px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Gradient border effect for earned badges */}
      {earned && (
        <div
          className="absolute -inset-[2px] rounded-2xl opacity-80"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.6), rgba(138, 43, 226, 0.6), rgba(0, 255, 255, 0.6))',
            zIndex: -1,
            filter: 'blur(1px)',
          }}
        />
      )}

      {/* Starry background effect */}
      <div
        className="absolute inset-0 rounded-2xl opacity-30"
        style={{
          backgroundImage: `radial-gradient(2px 2px at 20% 30%, rgba(255, 255, 255, 0.8), transparent),
                            radial-gradient(2px 2px at 60% 70%, rgba(0, 255, 255, 0.6), transparent),
                            radial-gradient(1px 1px at 50% 50%, rgba(255, 255, 255, 0.9), transparent),
                            radial-gradient(1px 1px at 80% 10%, rgba(138, 43, 226, 0.7), transparent),
                            radial-gradient(2px 2px at 90% 40%, rgba(0, 255, 255, 0.5), transparent),
                            radial-gradient(1px 1px at 33% 60%, rgba(255, 255, 255, 0.7), transparent),
                            radial-gradient(2px 2px at 10% 80%, rgba(138, 43, 226, 0.6), transparent)`,
          backgroundSize: '200% 200%',
        }}
      />

      {/* Neon glow effect for earned badges */}
      {earned && (
        <>
          <div
            className="absolute inset-0 rounded-2xl opacity-40"
            style={{
              background:
                'radial-gradient(circle at 30% 20%, rgba(0, 255, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(138, 43, 226, 0.15) 0%, transparent 50%)',
              pointerEvents: 'none',
            }}
          />
          <div
            className="absolute -inset-1 rounded-2xl opacity-20 blur-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.4), rgba(138, 43, 226, 0.4))',
              pointerEvents: 'none',
            }}
          />
        </>
      )}

      <div className="flex items-start gap-5 relative z-10">
        {/* Badge Image */}
        <div
          className="relative shrink-0 rounded-xl overflow-hidden"
          style={{
            width: '100px',
            height: '100px',
            border: earned
              ? '3px solid transparent'
              : '2px solid rgba(100, 100, 120, 0.2)',
            background: earned
              ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(138, 43, 226, 0.3)) padding-box, linear-gradient(135deg, rgba(0, 255, 255, 0.6), rgba(138, 43, 226, 0.6)) border-box'
              : 'rgba(0, 0, 0, 0.4)',
            boxShadow: earned
              ? '0 0 25px rgba(0, 255, 255, 0.5), 0 0 50px rgba(138, 43, 226, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.4), inset 0 0 40px rgba(0, 255, 255, 0.1)'
              : 'inset 0 0 15px rgba(0, 0, 0, 0.5)',
            position: 'relative',
          }}
        >
          <Image
            src={imagePath}
            alt={name}
            width={100}
            height={100}
            className={cn(
              'w-full h-full object-cover',
              !earned && 'grayscale opacity-40'
            )}
            style={{
              filter: earned
                ? 'brightness(1.1) contrast(1.1)'
                : 'grayscale(100%) brightness(0.4) contrast(0.8)',
            }}
          />
          {earned && (
            <>
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(circle at center, transparent 40%, rgba(0, 255, 255, 0.15) 100%)',
                  pointerEvents: 'none',
                }}
              />
              <div
                className="absolute inset-0 animate-pulse"
                style={{
                  background:
                    'radial-gradient(circle at 50% 50%, rgba(138, 43, 226, 0.1) 0%, transparent 70%)',
                  pointerEvents: 'none',
                  animation: 'pulse 3s ease-in-out infinite',
                }}
              />
            </>
          )}
        </div>

        {/* Badge Info */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-xl font-bold mb-2 tracking-wide"
            style={{
              color: earned ? '#00ffff' : 'rgba(180, 180, 200, 0.6)',
              textShadow: earned
                ? '0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.4), 0 0 30px rgba(138, 43, 226, 0.3)'
                : '0 0 5px rgba(180, 180, 200, 0.3)',
              letterSpacing: '0.5px',
            }}
          >
            {name}
          </h3>
          <p
            className="text-sm mb-3 leading-relaxed"
            style={{
              color: earned ? 'rgba(200, 200, 220, 0.9)' : 'rgba(150, 150, 170, 0.6)',
              textShadow: earned ? '0 0 5px rgba(0, 255, 255, 0.2)' : 'none',
            }}
          >
            {description}
          </p>

          {earned ? (
            <>
              <p
                className="text-xs mb-3"
                style={{
                  color: 'rgba(160, 200, 220, 0.8)',
                  textShadow: '0 0 3px rgba(0, 255, 255, 0.3)',
                }}
              >
                Đạt được:{' '}
                <span style={{ color: '#00ffff', fontWeight: '600' }}>
                  {earnedDate
                    ? new Date(earnedDate).toLocaleDateString('vi-VN')
                    : '—'}
                </span>
              </p>
              <div className="mt-3">
                <span
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(0, 255, 255, 0.25), rgba(138, 43, 226, 0.25))',
                    color: '#00ffff',
                    border: '2px solid rgba(0, 255, 255, 0.4)',
                    textShadow: '0 0 8px rgba(0, 255, 255, 0.8), 0 0 15px rgba(138, 43, 226, 0.5)',
                    boxShadow:
                      '0 0 15px rgba(0, 255, 255, 0.4), 0 0 30px rgba(138, 43, 226, 0.2), inset 0 0 10px rgba(0, 255, 255, 0.1)',
                    letterSpacing: '0.5px',
                  }}
                >
                  ✓ Hoàn thành
                </span>
              </div>
            </>
          ) : (
            <>
              <p
                className="text-xs mb-3"
                style={{
                  color: 'rgba(140, 140, 160, 0.7)',
                }}
              >
                Yêu cầu: <span style={{ fontWeight: '500' }}>{requirement}</span>
              </p>
              {progress !== undefined && progress > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span
                      style={{
                        color: 'rgba(160, 180, 200, 0.8)',
                        fontWeight: '500',
                      }}
                    >
                      Tiến độ
                    </span>
                    <span
                      style={{
                        color: 'rgba(200, 220, 240, 0.9)',
                        fontWeight: '600',
                        textShadow: '0 0 5px rgba(0, 255, 255, 0.3)',
                      }}
                    >
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div
                    className="w-full h-2.5 rounded-full overflow-hidden relative"
                    style={{
                      background: 'rgba(0, 0, 0, 0.6)',
                      border: '1px solid rgba(100, 100, 120, 0.4)',
                      boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    <div
                      className="h-full transition-all duration-700 rounded-full relative"
                      style={{
                        width: `${progress}%`,
                        background:
                          'linear-gradient(90deg, rgba(0, 255, 255, 0.7), rgba(138, 43, 226, 0.7), rgba(0, 255, 255, 0.7))',
                        backgroundSize: '200% 100%',
                        boxShadow:
                          '0 0 15px rgba(0, 255, 255, 0.5), 0 0 30px rgba(138, 43, 226, 0.3), inset 0 0 10px rgba(0, 255, 255, 0.2)',
                        animation: 'shimmer 2s linear infinite',
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes sparkle {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 200% 200%;
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  )
}

export { Badge, badgeVariants, BadgeCard, badgeImageMap }
