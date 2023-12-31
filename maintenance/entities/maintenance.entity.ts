import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('maintenance')
export class Maintenance {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    created_at: Date;

    @Column()
    schedule: Date;

    @Column({ default: null })
    delay: number;

    @Column({ type: 'enum', enum: [1, 2] })
    plant: number;

    @Column({ default: null })
    start_maintenance: Date;

    @Column({ default: null })
    end_maintenance: Date;
}
