import { Module } from '@nestjs/common';
import { ConfigModule } from './config.module';

@Module({
  imports: [ConfigModule],
})
export class CommonModule {}
