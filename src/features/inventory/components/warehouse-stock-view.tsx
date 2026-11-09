'use client';

import React, { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  Input,
  Select,
  Tag,
  Empty,
  Package,
  CheckCircle,
  WarningCircle,
} from '@/components/ui';
import {
  useWarehouses,
  useWarehouseStocks,
  useAdjustWarehouseStock,
  WarehouseStock,
} from '@/features/inventory';

export function WarehouseStockView() {
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
      quantity: 10,
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
      title: 'Mã / Tên nguyên liệu',
      key: 'ingredient',
      render: (_: unknown, record: WarehouseStock) => (
        <div>
          <div className="font-semibold text-sushi-text">{record.ingredient?.name}</div>
          <div className="text-xs text-sushi-text-muted font-mono">{record.ingredient?.code}</div>
        </div>
      ),
    },
    {
      title: 'Đơn vị tính',
      dataIndex: ['ingredient', 'unit'],
      key: 'unit',
      width: 120,
      render: (unit: string) => <Tag className="font-mono text-xs">{unit}</Tag>,
    },
    {
      title: 'Tồn thực tế',
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
      title: 'Ngưỡng cảnh báo',
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
      title: 'Trạng thái',
      key: 'status',
      width: 160,
      render: (_: unknown, record: WarehouseStock) => {
        if (record.status === 'OUT_OF_STOCK') {
          return (
            <Tag color="error" className="px-2.5 py-1 text-xs rounded-full font-medium inline-flex items-center gap-1.5">
              <WarningCircle size={14} weight="fill" />
              <span>Hết hàng</span>
            </Tag>
          );
        }
        if (record.status === 'LOW_STOCK') {
          return (
            <Tag color="warning" className="px-2.5 py-1 text-xs rounded-full font-medium inline-flex items-center gap-1.5">
              <WarningCircle size={14} weight="fill" />
              <span>Gần hết</span>
            </Tag>
          );
        }
        return (
          <Tag color="success" className="px-2.5 py-1 text-xs rounded-full font-medium inline-flex items-center gap-1.5">
            <CheckCircle size={14} weight="fill" />
            <span>An toàn</span>
          </Tag>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 130,
      render: (_: unknown, record: WarehouseStock) => (
        <Button
          type="text"
          size="small"
          onClick={() => handleOpenAdjust(record)}
          className="text-sushi-gold hover:bg-sushi-gold/10 font-medium"
        >
          Nhập / Xuất
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Bộ chọn kho */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-sushi-card/60 border border-sushi-border/80 p-3.5 rounded-2xl">
        <div className="flex items-center gap-3">
          <Package size={20} className="text-sushi-gold shrink-0" />
          <span className="text-sm font-semibold text-sushi-text">Chọn Kho nguyên vật liệu:</span>
          <Select
            value={activeWarehouseId}
            onChange={setSelectedWarehouseId}
            loading={warehousesLoading}
            className="w-72"
            options={warehouses.map((w) => ({
              value: w.id,
              label: `${w.name} (${w.code})`,
            }))}
          />
        </div>

        {selectedWarehouse && (
          <div className="text-xs text-sushi-text-muted">
            Địa chỉ: <strong>{selectedWarehouse.address || 'Trung tâm'}</strong> • Số chi nhánh liên kết:{' '}
            <strong>{selectedWarehouse._count?.branches || 1}</strong>
          </div>
        )}
      </div>

      {/* Bảng tồn kho */}
      <div className="bg-sushi-card border border-sushi-border/80 rounded-2xl overflow-hidden">
        <Table
          columns={columns}
          dataSource={stocks}
          rowKey="id"
          loading={stocksLoading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          locale={{
            emptyText: <Empty description="Kho này chưa có dữ liệu nguyên vật liệu" />,
          }}
        />
      </div>

      {/* Modal Điều chỉnh tồn kho */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-sushi-text">
            <Package size={20} className="text-sushi-gold" />
            <span>Điều chỉnh tồn kho: {adjustingStock?.ingredient?.name}</span>
          </div>
        }
        open={isAdjustModalOpen}
        onCancel={() => setIsAdjustModalOpen(false)}
        onOk={handleSaveAdjustment}
        confirmLoading={adjustStockMutation.isPending}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" className="pt-2">
          <div className="p-3 mb-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-400">Tồn hiện tại trong kho:</span>
            <span className="text-sm font-bold font-mono text-sushi-gold">
              {adjustingStock?.currentStock.toLocaleString()} {adjustingStock?.ingredient?.unit}
            </span>
          </div>

          <Form.Item name="type" label="Loại giao dịch" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'IN', label: '📥 Nhập thêm kho (Cộng tồn)' },
                { value: 'OUT', label: '📤 Xuất kho thủ công (Trừ tồn)' },
              ]}
            />
          </Form.Item>

          <Form.Item name="reason" label="Lý do" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'PURCHASE', label: 'Nhập hàng nhà cung cấp' },
                { value: 'ADJUSTMENT', label: 'Kiểm kê cân đối' },
                { value: 'DISCARD_WASTE', label: 'Hủy hỏng / Hết hạn' },
                { value: 'KITCHEN_USAGE', label: 'Xuất chế biến bổ sung' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng' },
              { type: 'number', min: 0.001, message: 'Số lượng phải > 0' },
            ]}
          >
            <InputNumber
              className="w-full"
              step={1}
              precision={3}
              addonAfter={adjustingStock?.ingredient?.unit || 'ĐVT'}
            />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea placeholder="Ghi chú bổ sung..." rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
