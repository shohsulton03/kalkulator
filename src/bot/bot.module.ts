import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BootUpdate } from './bot.update';

@Module({
  providers: [BotService, BootUpdate],
})
export class BotModule {}
