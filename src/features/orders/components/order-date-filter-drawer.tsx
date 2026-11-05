'use client';

import React, { useState } from 'react';
import { Drawer, Modal, Button, DatePicker } from '@/components/ui';
import { CalendarBlank, X } from '@phosphor-icons/react';
import dayjs, { Dayjs } from 'dayjs';
import { SUSHICOLORS } from '@/lib/theme';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';

interface OrderDateFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  startDate?: string;
  endDate?: string;
  onApply: (filter: { startDate?: string; endDate?: string }) => void;
  onReset: () => void;
}

function FilterForm({
  startDate,
  endDate,
  onClose,
  onApply,
  onReset,
}: {
  startDate?: string;
  endDate?: string;
  onClose: () => void;
  onApply: (filter: { startDate?: string; endDate?: string }) => void;
  onReset: () => void;
}) {
  const [tempStart, setTempStart] = useState<Dayjs | null>(
    startDate ? dayjs(startDate) : null,
  );
  const [tempEnd, setTempEnd] = useState<Dayjs | null>(
    endDate ? dayjs(endDate) : null,
  );

  const handleApply = () => {
    onApply({
      startDate: tempStart ? tempStart.format('YYYY-MM-DD') : undefined,
      endDate: tempEnd ? tempEnd.format('YYYY-MM-DD') : undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setTempStart(null);
    setTempEnd(null);
    onReset();
    onClose();
  };

  const handleQuickSelect = (type: 'today' | '7days' | '30days') => {
    const now = dayjs();
    if (type === 'today') {
      setTempStart(now);
      setTempEnd(now);
    } else if (type === '7days') {
      setTempStart(now.subtract(6, 'day'));
      setTempEnd(now);
    } else if (type === '30days') {
      setTempStart(now.subtract(29, 'day'));
      setTempEnd(now);
    }
  };

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      {/* Header: BỘ LỌC + Nút đóng X */}
      <div className="flex items-center justify-between pb-3 border-b border-sushi-border">
        <h3 className="text-base font-bold uppercase tracking-wider text-sushi-text font-sans">
          BỘ LỌC
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-sushi-text-muted hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="Đóng bộ lọc"
        >
          <X size={20} />
        </button>
      </div>

      {/* Lựa chọn nhanh */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-sushi-text-muted shrink-0">Nhanh:</span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => handleQuickSelect('today')}
            className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-sushi-border transition-colors cursor-pointer"
          >
            Hôm nay
          </button>
          <button
            type="button"
            onClick={() => handleQuickSelect('7days')}
            className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-sushi-border transition-colors cursor-pointer"
          >
            7 ngày qua
          </button>
          <button
            type="button"
            onClick={() => handleQuickSelect('30days')}
            className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-sushi-border transition-colors cursor-pointer"
          >
            30 ngày qua
          </button>
        </div>
      </div>

      {/* Trường chọn Ngày bắt đầu */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-sushi-text block">
          Ngày bắt đầu
        </label>
        <DatePicker
          value={tempStart}
          onChange={(val) => setTempStart(val)}
          format="DD/MM/YYYY"
          placeholder="Chọn ngày bắt đầu"
          className="w-full h-11 rounded-xl bg-sushi-surface border-sushi-border text-sushi-text placeholder:text-zinc-500 font-sans"
          suffixIcon={<CalendarBlank size={18} className="text-sushi-text-muted" />}
        />
      </div>

      {/* Trường chọn Ngày kết thúc */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-sushi-text block">
          Ngày kết thúc
        </label>
        <DatePicker
          value={tempEnd}
          onChange={(val) => setTempEnd(val)}
          format="DD/MM/YYYY"
          placeholder="Chọn ngày kết thúc"
          disabledDate={(current) =>
            tempStart ? current && current.isBefore(tempStart, 'day') : false
          }
          className="w-full h-11 rounded-xl bg-sushi-surface border-sushi-border text-sushi-text placeholder:text-zinc-500 font-sans"
          suffixIcon={<CalendarBlank size={18} className="text-sushi-text-muted" />}
        />
      </div>

      {/* Cụm nút hành động dưới cùng */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button
          size="large"
          onClick={handleReset}
          className="h-12 rounded-xl font-semibold border-sushi-border text-sushi-text hover:bg-zinc-800"
        >
          Thiết lập lại
        </Button>
        <Button
          size="large"
          type="primary"
          onClick={handleApply}
          className="h-12 rounded-xl font-semibold bg-sushi-gold hover:opacity-90 text-black border-none shadow-md"
        >
          Áp dụng
        </Button>
      </div>
    </div>
  );
}

export function OrderDateFilterDrawer({
  open,
  onClose,
  startDate,
  endDate,
  onApply,
  onReset,
}: OrderDateFilterDrawerProps) {
  const isMobile = useIsMobile();

  // Desktop (>= 768px): Modal căn giữa nhỏ gọn, không choán toàn màn hình
  if (!isMobile) {
    return (
      <Modal
        open={open}
        onCancel={onClose}
        width={480}
        centered
        footer={null}
        closable={false}
        styles={{
          body: {
            backgroundColor: SUSHICOLORS.card,
            padding: 0,
          },
        }}
        className="[&_.ant-modal-content]:bg-sushi-card [&_.ant-modal-content]:border [&_.ant-modal-content]:border-sushi-border [&_.ant-modal-content]:rounded-2xl"
      >
        {open && (
          <FilterForm
            key={`${startDate || ''}-${endDate || ''}`}
            startDate={startDate}
            endDate={endDate}
            onClose={onClose}
            onApply={onApply}
            onReset={onReset}
          />
        )}
      </Modal>
    );
  }

  // Mobile (< 768px): Bottom Sheet Drawer vuốt từ dưới lên giữ nguyên 100%
  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="bottom"
      closable={false}
      size="auto"
      styles={{
        wrapper: { maxHeight: '90vh' },
        section: {
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          overflow: 'hidden',
          backgroundColor: SUSHICOLORS.card,
        },
        body: {
          padding: '20px',
          backgroundColor: SUSHICOLORS.card,
        },
      }}
      className="rounded-t-3xl overflow-hidden [&_.ant-drawer-body]:p-5 [&_.ant-drawer-body]:bg-sushi-card [&_.ant-drawer-section]:bg-sushi-card [&_.ant-drawer-content]:bg-sushi-card"
    >
      {open && (
        <FilterForm
          key={`${startDate || ''}-${endDate || ''}`}
          startDate={startDate}
          endDate={endDate}
          onClose={onClose}
          onApply={onApply}
          onReset={onReset}
        />
      )}
    </Drawer>
  );
}
