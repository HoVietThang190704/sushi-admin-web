'use client';

import React from 'react';
import { Modal, Drawer } from 'antd';
import { X } from '@phosphor-icons/react';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';
import { SUSHICOLORS } from '@/lib/theme';

export interface ResponsiveModalDrawerProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  width?: number | string;
  destroyOnHidden?: boolean;
  destroyOnClose?: boolean;
  className?: string;
  maxHeight?: string;
  footer?: React.ReactNode;
}

export function ResponsiveModalDrawer({
  open,
  onClose,
  title,
  children,
  width = 520,
  destroyOnHidden,
  destroyOnClose,
  className,
  maxHeight = '90vh',
  footer,
}: ResponsiveModalDrawerProps) {
  const isMobile = useIsMobile();
  const shouldDestroy = destroyOnHidden ?? destroyOnClose ?? true;

  // Desktop (>= 768px): Căn giữa dạng Modal chuẩn
  if (!isMobile) {
    return (
      <Modal
        title={title}
        open={open}
        onCancel={onClose}
        footer={footer ?? null}
        destroyOnHidden={shouldDestroy}
        width={width}
        className={className}
      >
        {children}
      </Modal>
    );
  }

  // Mobile (< 768px): Bottom Sheet Drawer vuốt từ đáy màn hình lên phong cách hiện đại
  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="bottom"
      closable={false}
      size="auto"
      destroyOnHidden={shouldDestroy}
      styles={{
        wrapper: { maxHeight },
        section: {
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          overflow: 'hidden',
          maxHeight,
          backgroundColor: SUSHICOLORS.card,
        },
        body: {
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          maxHeight,
          backgroundColor: SUSHICOLORS.card,
        },
      }}
      className={`rounded-t-3xl overflow-hidden [&_.ant-drawer-content]:bg-sushi-card [&_.ant-drawer-section]:bg-sushi-card [&_.ant-drawer-body]:bg-sushi-card ${className || ''}`}
    >
      {/* Sticky Mobile Header with Pill handle & Close X */}
      <div className="sticky top-0 z-20 bg-sushi-card/95 backdrop-blur-md px-5 pt-3 pb-3 border-b border-sushi-border/80 shrink-0">
        <div className="w-10 h-1 bg-zinc-600/80 rounded-full mx-auto mb-2.5" />
        <div className="flex items-center justify-between gap-3">
          <div className="font-bold text-base text-sushi-text tracking-wide truncate">
            {title}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 rounded-full flex items-center justify-center text-sushi-text-muted hover:text-white hover:bg-sushi-surface transition-colors shrink-0 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable Form Content */}
      <div className="p-5 overflow-y-auto flex-1 overscroll-contain">
        {children}
      </div>

      {/* Optional bottom footer */}
      {footer && (
        <div className="sticky bottom-0 z-20 bg-sushi-card/95 backdrop-blur-md px-5 py-3 border-t border-sushi-border/80 shrink-0">
          {footer}
        </div>
      )}
    </Drawer>
  );
}
