import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Execution } from './execution.entity';
import { ExecutionStatus } from './execution-status.enum';

@Entity({ name: 'execution_events' })
export class ExecutionEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'execution_id' })
  executionId!: string;

  @ManyToOne(() => Execution, (execution) => execution.events, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'execution_id' })
  execution!: Execution;

  @Column({
    type: 'enum',
    enum: ExecutionStatus,
    enumName: 'execution_status',
    name: 'from_status',
    nullable: true,
  })
  fromStatus!: ExecutionStatus | null;

  @Column({
    type: 'enum',
    enum: ExecutionStatus,
    enumName: 'execution_status',
    name: 'to_status',
  })
  toStatus!: ExecutionStatus;

  @Column({ type: 'text', name: 'message', nullable: true })
  message!: string | null;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
  })
  createdAt!: Date;
}
