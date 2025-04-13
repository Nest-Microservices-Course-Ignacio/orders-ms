import { OrderStatus } from "../enum/orderStatus.enum";

export interface OrderWithProducts {
    OrderItem: {
        name: string;
        id: string;
        productId: number;
        quantity: number;
        price: number;
        orderId: string;
    }[];
    id: string;
    totalAmount: number;
    totalItem: number;
    status: OrderStatus;
    paid: boolean;
    paidAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
