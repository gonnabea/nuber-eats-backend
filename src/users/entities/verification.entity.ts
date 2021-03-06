import { v4 as uuidv4 } from 'uuid';
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { User } from "./user.entity";

@InputType({isAbstract: true})
@ObjectType()
@Entity()
export class Verification extends CoreEntity {

    @Column()
    @Field(type => String)
    code: string;

    @OneToOne(type => User, {onDelete: "CASCADE"})
    @JoinColumn()
    user: User;

    @BeforeInsert()
    createCode(): void {
        // Math.random().toString(36).substring(2) <- 또다른 랜덤문자 생성방법
        this.code = uuidv4()
    }
}