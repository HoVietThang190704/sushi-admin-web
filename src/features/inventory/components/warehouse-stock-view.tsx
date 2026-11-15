'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Table,
  Button,
  SushiButton,
  ResponsiveModalDrawer,
  Form,
  InputNumber,
  Input,
  Select,
  Tag,
  Package,
  Gear,
  CheckCircle,
  WarningCircle,
  SushiMobileCardList,
  SushiCardItem,
  SushiEmptyState,
} from '@/components/ui';
import {
  useWarehouses,
  useWarehouseStocks,
  useAdjustWarehouseStock,
  WarehouseStock,
} from '@/features/inventory';
import { useTranslation } from '@/lib/i18n';

export function WarehouseStockView() {
  const { t } = useTranslation();
  const { data: warehouses = [], isLoading: warehousesLoading } = useWarehouses();
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | undefined>(undefined);

  // Set default warehouse if none selected
  const activeWarehouseId = selectedWarehouseId || warehouses[0]?.id;

  const { data: stocks = [], isLoading: stocksLoading } = useWarehouseStocks(activeWarehouseId);
  const adjustStockMutation = useAdjustWarehouseStock();

  const [adjustingStock, setAdjustingStock] = useState<WarehouseStock | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleOpenAdjust = (stock: WarehouseStock) => {
    setAdjustingStock(stock);
    form.setFieldsValue({
      type: 'IN',
      reason: 'PURCHASE',
      quantity: 1,
      note: '',
    });
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjustment = async () => {
    try {
      const values = await form.validateFields();
      if (!activeWarehouseId || !adjustingStock) return;

      await adjustStockMutation.mutateAsync({
        warehouseId: activeWarehouseId,
        ingredientId: adjustingStock.ingredientId,
        dto: {
          type: values.type,
          reason: values.reason,
          quantity: values.quantity,
          note: values.note,
        },
      });

      setIsAdjustModalOpen(false);
    } catch {
      // Handled
    }
  };

  const selectedWarehouse = warehouses.find((w) => w.id === activeWarehouseId);

  const columns = [
    {
      title: t('warehouseView.colIngredient'),
      key: 'ingredient',
      render: (_: unknown, record: WarehouseStock) => (
        <div>
          <div className="font-semibold text-sushi-text">{record.ingredient?.name}</div>
          <div className="text-xs text-sushi-text-muted font-mono">{record.ingredient?.code}</div>
        </div>
      ),
    },
    {
      title: t('warehouseView.colUnit'),
      dataIndex: ['ingredient', 'unit'],
      key: 'unit',
      width: 120,
      render: (unit: string) => <Tag className="font-mono text-xs">{unit}</Tag>,
    },
    {
      title: t('warehouseView.colStock'),
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 160,
      render: (stock: number, record: WarehouseStock) => (
        <div className="font-mono font-bold text-base text-sushi-text">
          {stock.toLocaleString()} <span className="text-xs text-sushi-text-muted">{record.ingredient?.unit}</span>
        </div>
      ),
    },
    {
      title: t('warehouseView.colMinStock'),
      dataIndex: 'minStock',
      key: 'minStock',
      width: 150,
      render: (min: number, record: WarehouseStock) => (
        <span className="text-xs text-sushi-text-muted font-mono">
          {min} {record.ingredient?.unit}
        </span>
      ),
    },
    {
      title: t('warehouseView.colStatus'),
      key: 'status',
      width: 160,
      render: (_: unknown, record: WarehouseStock) => {
        if (record.status === 'OUT_OF_STOCK') {
          return (
            <Tag color="error" className="px-2.5 py-1 text-xs rounded-full font-medium inline-flex items-center gap-1.5">
              <WarningCircle size={14} weight="fill" />
              <span>{t('dashboard.alertOut')}</span>
            </Tag>
          );
        }
        if (record.status === 'LOW_STOCK') {
          return (
            <Tag color="warning" className="px-2.5 py-1 text-xs rounded-full font-medium inline-flex items-center gap-1.5">
              <WarningCircle size={14} weight="fill" />
              <span>{t('dashboard.alertLow')}</span>
            </Tag>
          );
        }
        return (
          <Tag color="success" className="px-2.5 py-1 text-xs rounded-full font-medium inline-flex items-center gap-1.5">
            <CheckCircle size={14} weight="fill" />
            <span>{t('dashboard.alertSafe')}</span>
          </Tag>
        );
      },
    },
    {
      title: t('warehouseView.colActions'),
      key: 'actions',
      width: 130,
      render: (_: unknown, record: WarehouseStock) => (
        <Button
          type="text"
          size="small"
          onClick={() => handleOpenAdjust(record)}
          className="text-sushi-gold hover:bg-sushi-gold/10 font-medium"
        >
          {t('warehouseView.adjustBtn')}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Bộ chọn kho (Responsive) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 bg-sushi-card/60 border border-sushi-border/80 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-sushi-gold shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-sushi-text">{t('warehouseView.selectWarehouse')}</span>
          </div>
          <Select
            value={activeWarehouseId}
            onChange={setSelectedWarehouseId}
            loading={warehousesLoading}
            className="w-full sm:w-72 h-10 sm:h-9"
            options={warehouses.map((w) => ({
              value: w.id,
              label: `${w.name} (${w.code})`,
            }))}
          />
          <Link href="/dashboard/warehouses">
            <Button
              size="small"
              icon={<Gear size={14} />}
              className="rounded-lg h-9 px-3 text-xs text-sushi-gold border-sushi-gold/30 hover:bg-sushi-gold/10 font-medium w-full sm:w-auto"
            >
              {t('warehousesPage.manageBtn')}
            </Button>
          </Link>
        </div>

        {selectedWarehouse && (
          <div className="text-3xs sm:text-xs text-sushi-text-muted">
            <span>{t('warehouseView.address')}: <strong>{selectedWarehouse.address || 'Trung tâm'}</strong></span>
            <span className="mx-1.5">•</span>
            <span>{t('warehouseView.linkedBranches')}: <strong>{selectedWarehouse._count?.branches ?? 0}</strong></span>
          </div>
        )}
      </div>

      {/* 1. Giao diện Mobile Card List (< md) */}
      <SushiMobileCardList
        items={stocks}
        pageSize={8}
        loading={stocksLoading}
        emptyState={
          <SushiEmptyState
            isCard
            icon={<Package size={24} />}
            title={t('warehouseView.emptyTitle')}
            description={t('warehouseView.emptyDesc')}
          />
        }
        renderItem={(item) => {
          const colorClass =
            item.status === 'OUT_OF_STOCK'
              ? 'text-red-400 font-bold'
              : item.status === 'LOW_STOCK'
              ? 'text-amber-400 font-bold'
              : 'text-sushi-text font-bold';

          return (
            <SushiCardItem>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-sushi-text truncate">
                    {item.ingredient?.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-2xs text-sushi-text-dim font-mono mt-0.5">
                    <span className="truncate">{item.ingredient?.code}</span>
                    <span className="shrink-0">· Min: {item.minStock} {item.ingredient?.unit}</span>
                  </div>
                </div>

                <Button
                  size="small"
                  onClick={() => handleOpenAdjust(item)}
                  className="rounded-lg h-8 px-2.5 text-xs text-sushi-gold border-sushi-gold/30 hover:bg-sushi-gold/10 shrink-0 font-medium"
                >
                  {t('warehouseView.adjustBtn')}
                </Button>
              </div>

              <div className="mt-3 pt-2.5 border-t border-sushi-border/60 flex items-center justify-between text-2xs">
                <div className="flex items-baseline space-x-1 font-mono">
                  <span className="text-sushi-text-dim text-3xs uppercase mr-0.5">{t('warehouseView.colStock')}:</span>
                  <span className={`text-sm ${colorClass}`}>{item.currentStock.toLocaleString()}</span>
                  <span className="text-sushi-text-dim">{item.ingredient?.unit}</span>
                </div>

                <div>
                  {item.status === 'OUT_OF_STOCK' ? (
                    <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-3xs font-semibold bg-red-500/15 border border-red-500/35 text-red-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      <span>{t('dashboard.alertOut')}</span>
                    </span>
                  ) : item.status === 'LOW_STOCK' ? (
                    <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-3xs font-semibold bg-amber-500/15 border border-amber-500/35 text-amber-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>{t('dashboard.alertLow')}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-3xs font-medium bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{t('dashboard.alertSafe')}</span>
                    </span>
                  )}
                </div>
              </div>
            </SushiCardItem>
          );
        }}
      />

      {/* 2. Giao diện Desktop Table (>= md) */}
      <div className="hidden md:block bg-sushi-card border border-sushi-border/80 rounded-2xl overflow-hidden shadow-sm">
        <Table
          columns={columns}
          dataSource={stocks}
          rowKey="id"
          loading={stocksLoading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: (
              <SushiEmptyState
                icon={<Package size={24} />}
                title={t('warehouseView.emptyTitle')}
                description={t('warehouseView.emptyDesc')}
              />
            ),
          }}
        />
      </div>

      {/* Modal / Bottom Sheet Điều chỉnh tồn kho */}
      <ResponsiveModalDrawer
        title={
          <div className="flex items-center gap-2 text-sushi-text font-bold">
            <Package size={20} className="text-sushi-gold" />
            <span>{t('warehouseView.modalTitle')}: {adjustingStock?.ingredient?.name}</span>
          </div>
        }
        open={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        footer={
          <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-end">
            <Button
              onClick={() => setIsAdjustModalOpen(false)}
              className="w-full sm:w-auto h-10 rounded-xl"
            >
              {t('common.cancel')}
            </Button>
            <SushiButton
              type="primary"
              onClick={handleSaveAdjustment}
              loading={adjustStockMutation.isPending}
              className="w-full sm:w-auto h-10 rounded-xl"
            >
              {t('warehouseView.confirmBtn')}
            </SushiButton>
          </div>
        }
      >
        <Form form={form} layout="vertical" className="pt-2">
          <div className="p-3 mb-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-400">{t('warehouseView.currentStockLabel')}</span>
            <span className="text-sm font-bold font-mono text-sushi-gold">
              {adjustingStock?.currentStock.toLocaleString()} {adjustingStock?.ingredient?.unit}
            </span>
          </div>

          <Form.Item name="type" label={t('warehouseView.txTypeLabel')} rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'IN', label: `📥 ${t('warehouseView.txTypeIn')}` },
                { value: 'OUT', label: `📤 ${t('warehouseView.txTypeOut')}` },
              ]}
            />
          </Form.Item>

          <Form.Item name="reason" label={t('warehouseView.reasonLabel')} rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'PURCHASE', label: t('warehouseView.reasonPurchase') },
                { value: 'ADJUSTMENT', label: t('warehouseView.reasonAdjustment') },
                { value: 'DISCARD_WASTE', label: t('warehouseView.reasonWaste') },
                { value: 'KITCHEN_USAGE', label: t('warehouseView.reasonKitchen') },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="quantity"
            label={t('warehouseView.quantityLabel')}
            rules={[
              { required: true, message: t('warehouseView.quantityLabel') },
              { type: 'number', min: 0.001, message: '> 0' },
            ]}
          >
            <InputNumber
              className="w-full"
              step={1}
              precision={3}
              suffix={adjustingStock?.ingredient?.unit || 'ĐVT'}
            />
          </Form.Item>

          <Form.Item name="note" label={t('warehouseView.noteLabel')}>
            <Input.TextArea placeholder={t('warehouseView.noteLabel')} rows={2} />
          </Form.Item>
        </Form>
      </ResponsiveModalDrawer>
    </div>
  );
}
