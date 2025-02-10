import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class InventoryItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  amount: number;
}
