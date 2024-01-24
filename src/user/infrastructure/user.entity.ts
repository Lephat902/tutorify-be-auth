import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Geometry, BaseEntity } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Gender, UserRole } from './enums';

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ unique: true })
    email: string;
  
    @Column({ unique: true })
    username: string;
  
    @Column({ nullable: false })
    @Exclude()
    password: string;
    
    @Column({ default: 0 })
    @Exclude()
    loginFailureCount: number;
  
    @Column({ default: '' })
    firstName: string;
  
    @Column({ default: '' })
    middleName: string;
  
    @Column({ default: '' })
    lastName: string;
  
    @Column({ type: 'enum', enum: Gender, nullable: true })
    gender: Gender;
  
    @Column({ default: '' })
    phoneNumber: string;
  
    @Column({ default: '' })
    imgUrl: string;
  
    @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
    role: UserRole;
  
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
  
    @Column({ default: false })
    isActivated: boolean;
  
    @Column({ default: false })
    isBlocked: boolean;
  
    @Column({ nullable: true })
    address: string;
  
    @Column({ nullable: true })
    wardId: number;
  
    @Column({ type: 'geometry', spatialFeatureType: 'Point', nullable: true })
    location: Geometry;
}