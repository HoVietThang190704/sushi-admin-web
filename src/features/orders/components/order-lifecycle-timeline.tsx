'use client';

import React, { useState } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import { OrderStatusHistory } from '../types';
import { getOrderStatusLabel, formatOrderActor } from '../utils';

interface OrderLifecycleTimelineProps {
  histories?: OrderStatusHistory[];
  collapsible?: boolean;
}

export function OrderLifecycleTimeline({
  histories,
  collapsible = false,
}: OrderLifecycleTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsible);

  if (!histories || histories.length === 0) return null;

  return (
    <div className="rounded-xl border border-sushi-border/70 bg-sushi-surface/30 overflow-hidden">
      {collapsible ? (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-sushi-text-muted hover:text-sushi-text transition-colors cursor-pointer"
        >
          <span className="uppercase tracking-wider">
            Lịch sử vòng đời ({histories.length})
          </span>
          <CaretDown
            size={14}
            className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
      ) : (
        <div className="px-3.5 pt-3 pb-2 text-xs font-bold uppercase tracking-wider text-sushi-text-muted">
          Lịch sử vòng đời đơn ({histories.length})
        </div>
      )}

      {isExpanded && (
        <div className="px-3.5 pb-3 pt-1 border-t border-sushi-border/40 space-y-1.5 text-xs">
          {histories.map((h) => (
            <div
              key={h.id}
              className="flex items-center justify-between text-xs py-1 border-b border-sushi-border/30 last:border-b-0"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full bg-sushi-gold shrink-0" />
                <span className="font-mono text-sushi-text-muted text-2xs shrink-0">
                  {new Date(h.createdAt).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
                <span className="font-medium text-sushi-text truncate">
                  {h.fromStatus ? (
                    <>
                      <span>{getOrderStatusLabel(h.fromStatus)}</span>
                      <span className="text-sushi-text-muted mx-1">→</span>
                    </>
                  ) : (
                    <span className="text-sushi-text-muted mr-1">Khởi tạo:</span>
                  )}
                  <span className="text-sushi-gold font-semibold">
                    {getOrderStatusLabel(h.toStatus)}
                  </span>
                </span>
                {h.reason && (
                  <span className="text-amber-400/90 italic text-2xs truncate">
                    ({h.reason})
                  </span>
                )}
              </div>
              <span className="text-sushi-text-muted text-2xs shrink-0 ml-2">
                bởi {formatOrderActor(h.changedBy)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
