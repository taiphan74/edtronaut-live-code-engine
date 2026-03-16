import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Execution } from '../../executions/entities/execution.entity';
import { CodeSessionStatus } from './code-session-status.enum';

@Entity({ name: 'code_sessions' })
export class CodeSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, name: 'language' })
  language!: string;

  @Column({ type: 'text', name: 'source_code' })
  sourceCode!: string;

  @Column({
    type: 'enum',
    enum: CodeSessionStatus,
    enumName: 'code_session_status',
    name: 'status',
    default: CodeSessionStatus.ACTIVE,
  })
  status!: CodeSessionStatus;

  @OneToMany(() => Execution, (execution) => execution.session)
  executions!: Execution[];

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
