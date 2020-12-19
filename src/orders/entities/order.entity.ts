import { Field, Float, InputType, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { IsEnum, IsNumber } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Dish } from "src/restaurants/entities/dish.entity";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from "typeorm";
import { OrderItem } from "./order-item.entity";

enum OrderStatus {
    Pending = "Pending",
    Cooking = "Cooking",
    PickedUp = "PickedUp",
    Delivered = "Delivered"
}

registerEnumType(OrderStatus,{name:"OrderStatus"})

@InputType("OrderInputType",{ isAbstract: true})
@ObjectType()
@Entity()
export class Order extends CoreEntity {

    @Field(type => User, {nullable: true})
    @ManyToOne(type => User, user => user.orders, {onDelete: 'SET NULL', nullable: true})
    customer?: User

    @Field(type => User, {nullable: true})
    @ManyToOne(type => User, user => user.rides, {onDelete: 'SET NULL', nullable: true})
    driver?: User

    @Field(type => Restaurant)
    @ManyToOne(type => Restaurant, Restaurant => Restaurant.orders, {onDelete: 'SET NULL', nullable: true})
    restaurant: Restaurant

    @Field(type => [OrderItem])
    @ManyToMany( type => OrderItem)
    @JoinTable()
    items: OrderItem[]

    @Column({nullable: true})
    @Field(type => Float, {nullable: true})
    @IsNumber()
    total?: number // 총 결제금액

    @Column({type:"enum", enum: OrderStatus})
    @Field(type => OrderStatus)
    @IsEnum(OrderStatus)
    status: OrderStatus
}