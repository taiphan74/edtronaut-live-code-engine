import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CodeSession } from '../../code-sessions/entities/code-session.entity';
import { ExecutionEvent } from './execution-event.entity';
import { ExecutionStatus } from './execution-status.enum';

@Entity({ name: 'executions' })
export class Execution {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'session_id' })
  sessionId!: string;

  @ManyToOne(() => CodeSession, (codeSession) => codeSession.executions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session!: CodeSession;

  @Column({
    type: 'enum',
    enum: ExecutionStatus,
    enumName: 'execution_status',
    name: 'status',
    default: ExecutionStatus.QUEUED,
  })
  status!: ExecutionStatus;

  @Column({ type: 'text', name: 'stdout', nullable: true })
  stdout!: string | null;

  @Column({ type: 'text', name: 'stderr', nullable: true })
  stderr!: string | null;

  @Column({ type: 'integer', name: 'execution_time_ms', nullable: true })
  executionTimeMs!: number | null;

  @Column({ type: 'integer', name: 'exit_code', nullable: true })
  exitCode!: number | null;

  @Column({
    type: 'timestamp with time zone',
    name: 'queued_at',
    nullable: true,
  })
  queuedAt!: Date | null;

  @Column({
    type: 'timestamp with time zone',
    name: 'started_at',
    nullable: true,
  })
  startedAt!: Date | null;

  @Column({
    type: 'timestamp with time zone',
    name: 'finished_at',
    nullable: true,
  })
  finishedAt!: Date | null;

  @Column({ type: 'integer', name: 'retry_count', default: 0 })
  retryCount!: number;

  @OneToMany(
    () => ExecutionEvent,
    (executionEvent) => executionEvent.execution,
  )
  events!: ExecutionEvent[];

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at',
  })
  updatedAt!: Date;
}
