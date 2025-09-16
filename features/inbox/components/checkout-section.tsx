"use client";

import { memo, useState } from "react";
import clsx from "clsx";
import { IconShoppingCart } from "@/icons";

interface CheckoutSectionProps {
  messageId: string | null;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

interface ProductInfo {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// Mock data
const mockCustomerInfo: CustomerInfo = {
  name: "Nguyễn Văn A",
  phone: "0123456789",
  email: "nguyenvana@email.com",
  address: "123 Đường ABC, Quận 1, TP.HCM",
};

const mockProducts: ProductInfo[] = [
  {
    id: "1",
    name: "Sản phẩm A",
    price: 500000,
    quantity: 1,
  },
  {
    id: "2",
    name: "Sản phẩm B",
    price: 300000,
    quantity: 2,
  },
];

export const CheckoutSection = memo(function CheckoutSection({ messageId }: CheckoutSectionProps) {
  const [orderNote, setOrderNote] = useState("");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  if (!messageId) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-4">
            <IconShoppingCart className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium mb-2">Tạo đơn hàng</h3>
          <p className="text-sm">Chọn tin nhắn để tạo đơn hàng</p>
        </div>
      </div>
    );
  }

  const totalAmount = mockProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);

  const handleCreateOrder = async () => {
    setIsCreatingOrder(true);
    try {
      // TODO: Create order logic
      console.log("Creating order with note:", orderNote);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      alert("Đơn hàng đã được tạo thành công!");
    } catch (error) {
      alert("Có lỗi xảy ra khi tạo đơn hàng");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
    <div className="h-full flex flex-col px-4 bg-gradient-to-b from-background to-muted rounded-xl ">
      {/* Header */}
      <div className="pb-4">
        <h2 className="font-semibold text-lg">Tạo đơn hàng</h2>
        <p className="text-sm text-muted-foreground">Thông tin khách hàng và sản phẩm</p>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-1">
        {/* Customer Information */}
        <div className="py-4">
          <h3 className="font-medium mb-3">Thông tin khách hàng</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-16">Tên:</span>
              <span className="text-sm font-medium">{mockCustomerInfo.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-16">SĐT:</span>
              <span className="text-sm font-medium">{mockCustomerInfo.phone}</span>
            </div>
            {mockCustomerInfo.email && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-16">Email:</span>
                <span className="text-sm font-medium">{mockCustomerInfo.email}</span>
              </div>
            )}
            {mockCustomerInfo.address && (
              <div className="flex items-start gap-2">
                <span className="text-sm text-muted-foreground w-16">Địa chỉ:</span>
                <span className="text-sm font-medium">{mockCustomerInfo.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Products */}
        <div className="py-4">
          <h3 className="font-medium mb-3">Sản phẩm</h3>
          <div className="space-y-3">
            {mockProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-semibold">
                  {product.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{product.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    SL: {product.quantity} x {product.price.toLocaleString()}đ
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">
                    {(product.price * product.quantity).toLocaleString()}đ
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Note */}
        <div className="py-4">
          <h3 className="font-medium mb-3">Ghi chú đơn hàng</h3>
          <textarea
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
            placeholder="Nhập ghi chú cho đơn hàng..."
            className="w-full p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
            rows={3}
          />
        </div>

        {/* Total */}
        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium">Tổng tiền:</span>
            <span className="font-bold text-lg text-primary">
              {totalAmount.toLocaleString()}đ
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleCreateOrder}
          disabled={isCreatingOrder}
          className={clsx(
            "flex-1 py-3 px-4 rounded-lg font-medium transition-colors duration-200",
            isCreatingOrder
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {isCreatingOrder ? "Đang tạo..." : "Tạo đơn hàng"}
        </button>
      </div>
    </div>
  );
});

export default CheckoutSection; 