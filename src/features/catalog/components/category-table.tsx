'use client';

import React, { useState } from 'react';
import {
  Table,
  Typography,
  SquaresFour,
  Eye,
  PencilSimple,
  Trash,
  Copy,
  Tooltip,
  message,
  SushiMobileCardList,
  SushiCardItem,
  SushiCardActions,
  SushiEmptyState,
} from '@/components/ui';
import { DotsSixVertical } from '@phosphor-icons/react';
import { Category } from '../types';
import { CategoryDetailModal } from './category-detail-modal';
import { useTranslation } from '@/lib/i18n';

const { Text } = Typography;

interface CategoryTableProps {
  categories: Category[];
  loading?: boolean;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
  onReorder?: (reorderedCategories: Category[]) => void;
}

export function CategoryTable({
  categories,
  loading,
  onEdit,
  onDelete,
  onReorder,
}: CategoryTableProps) {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [draggedCategories, setDraggedCategories] = useState<Category[] | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const displayCategories = draggedCategories ?? categories;

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    message.success(`${t('dashboard.copied')}: ${id.slice(0, 8)}...`);
  };

  // Drag & Drop bằng Pointer Events: hỗ trợ cả chuột Desktop lẫn chạm cảm ứng Mobile
  const handlePointerDragStart = (
    e: React.PointerEvent<HTMLDivElement>,
    startIndex: number,
  ) => {
    if (!onReorder) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.stopPropagation();

    const handleEl = e.currentTarget;
    handleEl.setPointerCapture(e.pointerId);

    let currentIndex = startIndex;
    let currentList = [...categories];

    setDraggedCategories(currentList);
    setDraggedIdx(startIndex);
    setDragOverIdx(startIndex);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const targetEl = document.elementFromPoint(
        moveEvent.clientX,
        moveEvent.clientY,
      );
      const itemEl = targetEl?.closest(
        '[data-category-dnd-index]',
      ) as HTMLElement | null;

      if (!itemEl) return;
      const hoverIndex = Number(itemEl.getAttribute('data-category-dnd-index'));
      if (Number.isNaN(hoverIndex) || hoverIndex === currentIndex) return;

      const updated = [...currentList];
      const [moved] = updated.splice(currentIndex, 1);
      updated.splice(hoverIndex, 0, moved);
      currentList = updated;
      currentIndex = hoverIndex;

      setDraggedCategories(updated);
      setDraggedIdx(hoverIndex);
      setDragOverIdx(hoverIndex);
    };

    const cleanup = () => {
      handleEl.removeEventListener('pointermove', handlePointerMove);
      handleEl.removeEventListener('pointerup', cleanup);
      handleEl.removeEventListener('pointercancel', cleanup);
      try {
        if (handleEl.hasPointerCapture(e.pointerId)) {
          handleEl.releasePointerCapture(e.pointerId);
        }
      } catch {
        // ignore if already released
      }

      const hasChanged = currentList.some(
        (cat, idx) => cat.id !== categories[idx]?.id,
      );

      setDraggedIdx(null);
      setDragOverIdx(null);
      setDraggedCategories(null);

      if (hasChanged) {
        onReorder(currentList);
      }
    };

    handleEl.addEventListener('pointermove', handlePointerMove);
    handleEl.addEventListener('pointerup', cleanup);
    handleEl.addEventListener('pointercancel', cleanup);
  };

  const columns = [
    ...(onReorder
      ? [
          {
            title: t('dashboard.categoryTableOrder'),
            key: 'sortOrder',
            width: 96,
            render: (_: unknown, _record: Category, index: number) => (
              <div
                className="flex items-center gap-2 py-1"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  onPointerDown={(e) => handlePointerDragStart(e, index)}
                  style={{ touchAction: 'none' }}
                  className="text-sushi-text-muted hover:text-sushi-gold transition-colors cursor-grab active:cursor-grabbing p-1 -ml-1 rounded-md hover:bg-white/5 select-none"
                  title={t('dashboard.categoryDragHint')}
                >
                  <DotsSixVertical size={18} weight="bold" />
                </div>
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-2xs font-mono font-bold bg-sushi-gold/15 text-sushi-gold border border-sushi-gold/30">
                  #{index + 1}
                </span>
              </div>
            ),
          },
        ]
      : []),
    {
      title: t('dashboard.categoryTableName'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Category) => (
        <div className="py-1 min-w-0">
          <Text strong className="text-sushi-text block text-sm font-sans">
            {text}
          </Text>
          <div className="flex items-center space-x-1.5 text-2xs text-sushi-text-dim font-mono mt-0.5">
            <span>ID: {record.id.slice(0, 8)}...</span>
            <Tooltip title={t('dashboard.copied')}>
              <button
                type="button"
                onClick={(e) => handleCopyId(record.id, e)}
                className="hover:text-sushi-text transition-colors p-0.5 cursor-pointer"
                aria-label="Copy UUID"
              >
                <Copy size={12} />
              </button>
            </Tooltip>
          </div>
        </div>
      ),
    },
    {
      title: t('dashboard.categoryTableCount'),
      key: 'productsCount',
      width: 160,
      render: (_: unknown, record: Category) => {
        const count = record._count?.products || 0;
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold font-mono bg-blue-500/10 border border-blue-500/25 text-blue-400">
            {count} {t('common.itemsCount')}
          </span>
        );
      },
    },
    {
      title: t('dashboard.categoryTableStatus'),
      key: 'status',
      width: 170,
      render: () => (
        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>{t('common.active')}</span>
        </span>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 140,
      align: 'right' as const,
      render: (_: unknown, record: Category) => (
        <div
          className="flex items-center justify-end space-x-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip title={t('ordersPage.detailBtn')}>
            <button
              type="button"
              onClick={() => setSelectedCategory(record)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sushi-text-muted hover:text-sushi-gold hover:bg-sushi-gold/10 transition-colors cursor-pointer border border-transparent hover:border-sushi-gold/30"
              aria-label={t('ordersPage.detailBtn')}
            >
              <Eye size={16} />
            </button>
          </Tooltip>

          <Tooltip title={t('dashboard.edit')}>
            <button
              type="button"
              onClick={() => onEdit?.(record)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sushi-text-muted hover:text-white hover:bg-sushi-card-hover transition-colors cursor-pointer border border-transparent hover:border-sushi-border"
              aria-label={t('dashboard.edit')}
            >
              <PencilSimple size={16} />
            </button>
          </Tooltip>

          <Tooltip title={t('dashboard.delete')}>
            <button
              type="button"
              onClick={() => onDelete?.(record)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sushi-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer border border-transparent hover:border-red-500/30"
              aria-label={t('dashboard.delete')}
            >
              <Trash size={16} />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* 1. Giao diện Mobile Card List (< md) */}
      <SushiMobileCardList
        items={displayCategories}
        pageSize={20}
        loading={loading}
        emptyState={
          <SushiEmptyState
            isCard
            icon={<SquaresFour size={24} />}
            title={t('dashboard.noDataTitle')}
            description={t('dashboard.noCategoriesDesc')}
          />
        }
        renderItem={(category, index) => {
          const count = category._count?.products || 0;
          const isDragging = draggedIdx === index;
          const isDragOver = dragOverIdx === index;

          return (
            <div data-category-dnd-index={index}>
              <SushiCardItem
                className={`cursor-pointer transition-all select-none ${
                  isDragging
                    ? 'opacity-45 scale-[0.98] border-dashed border-sushi-gold'
                    : isDragOver
                      ? 'border-sushi-gold ring-2 ring-sushi-gold/40 bg-sushi-gold/5'
                      : 'hover:border-sushi-gold/50 active:scale-[0.99]'
                }`}
              >
                <div onClick={() => setSelectedCategory(category)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      {onReorder && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          onPointerDown={(e) => handlePointerDragStart(e, index)}
                          style={{ touchAction: 'none' }}
                          className="text-sushi-text-muted hover:text-sushi-gold transition-colors shrink-0 cursor-grab active:cursor-grabbing p-1.5 -ml-1.5 rounded-lg hover:bg-white/5"
                          title={t('dashboard.categoryDragHint')}
                        >
                          <DotsSixVertical size={18} weight="bold" />
                        </div>
                      )}

                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-2xs font-mono font-bold bg-sushi-gold/15 text-sushi-gold border border-sushi-gold/30 shrink-0">
                        #{index + 1}
                      </span>

                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-sushi-text truncate">
                          {category.name}
                        </h4>
                        <div className="flex items-center space-x-1.5 text-2xs text-sushi-text-dim font-mono mt-0.5">
                          <span>ID: {category.id.slice(0, 8)}...</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyId(category.id, e)}
                            className="hover:text-sushi-text transition-colors p-0.5 cursor-pointer"
                            aria-label="Copy UUID"
                          >
                            <Copy size={11} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-1 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sushi-text-muted hover:text-sushi-gold hover:bg-sushi-gold/10 transition-colors border border-sushi-border/60 cursor-pointer"
                        aria-label={t('ordersPage.detailBtn')}
                        title={t('ordersPage.detailBtn')}
                      >
                        <Eye size={14} />
                      </button>
                      <SushiCardActions
                        onEdit={onEdit ? () => onEdit(category) : undefined}
                        onDelete={onDelete ? () => onDelete(category) : undefined}
                        editLabel={t('dashboard.edit')}
                        deleteLabel={t('dashboard.delete')}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-sushi-border/60 flex items-center justify-between text-2xs">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md font-semibold font-mono bg-blue-500/10 border border-blue-500/25 text-blue-400">
                      {count} {t('common.itemsCount')}
                    </span>
                    <span className="inline-flex items-center space-x-1.5 text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{t('common.active')}</span>
                    </span>
                  </div>
                </div>
              </SushiCardItem>
            </div>
          );
        }}
      />

      {/* 2. Giao diện Desktop Table (>= md) */}
      <div className="hidden md:block">
        <Table
          loading={loading}
          dataSource={displayCategories}
          columns={columns}
          rowKey="id"
          onRow={(record, index) => {
            const idx = index ?? 0;
            const isDragging = draggedIdx === idx;
            const isDragOver = dragOverIdx === idx;
            return {
              'data-category-dnd-index': idx,
              onClick: () => setSelectedCategory(record),
              className: `cursor-pointer transition-colors ${
                isDragging
                  ? 'opacity-45 bg-sushi-gold/10'
                  : isDragOver
                    ? 'bg-sushi-gold/15 ring-1 ring-sushi-gold'
                    : 'hover:bg-zinc-900/60'
              }`,
            } as React.HTMLAttributes<HTMLTableRowElement>;
          }}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            className: 'py-3 px-4',
          }}
          expandable={{
            childrenColumnName: 'none',
          }}
          scroll={{ x: 'max-content' }}
          className="border border-sushi-border rounded-2xl overflow-hidden shadow-sm"
          locale={{
            emptyText: (
              <SushiEmptyState
                icon={<SquaresFour size={24} />}
                title={t('dashboard.noDataTitle')}
                description={t('dashboard.noCategoriesDesc')}
              />
            ),
          }}
        />
      </div>

      {/* 3. Modal / Bottom Sheet Chi tiết Danh Mục */}
      <CategoryDetailModal
        category={selectedCategory}
        open={Boolean(selectedCategory)}
        onClose={() => setSelectedCategory(null)}
        onEdit={onEdit}
      />
    </>
  );
}
