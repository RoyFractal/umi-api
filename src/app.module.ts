import { Module } from '@nestjs/common';
import { UmiController } from './umi.controller';
import { UmiService } from './umi.service';

@Module({
  imports: [],
  controllers: [UmiController],
  providers: [UmiService],
})
export class AppModule {}
