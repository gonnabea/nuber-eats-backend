import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { User } from "src/users/entities/user.entity";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dtos/edit-order.dto";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";
import { GetOrdersOutput, GetOrdersInput } from "./dtos/get-orders.dto";
import { Order } from "./entities/order.entity";
import { OrdersService } from "./orders.service";


@Resolver(of => Order)
export class OrderResolver {
    constructor(private readonly ordersService: OrdersService) {
    }

    @Mutation(returns => CreateOrderOutput)
    @Role(["Client"])
    async createOrder(@AuthUser() customer:User, @Args("input") createOrderInput:CreateOrderInput): Promise<CreateOrderOutput> {
          return this.ordersService.createOrder(customer, createOrderInput)
    }

    @Query(returns => GetOrdersOutput)
    @Role(["Any"])
    async getOrders(
        @AuthUser() userInfo:User,
        @Args("input") getOrdersInput: GetOrdersInput
    ):Promise<GetOrdersOutput> {
        return this.ordersService.getOrders(userInfo, getOrdersInput)
    }

    @Query(returns => GetOrderOutput)
    @Role(["Any"])
    async getOrder(
        @AuthUser() userInfo:User,
        @Args("input") getOrderInput: GetOrderInput
    ):Promise<GetOrderOutput> {
        return this.ordersService.getOrder(userInfo, getOrderInput)
    }

    @Mutation(returns => EditOrderOutput)
    @Role(["Any"])
    async editOrder(@AuthUser() user:User, @Args("input") editOrderInput: EditOrderInput): Promise<EditOrderOutput> {
        return this.ordersService.editOrder(user, editOrderInput)
    }
}