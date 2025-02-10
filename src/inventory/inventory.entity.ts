import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'inventory_items', schema: 'public' })
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
