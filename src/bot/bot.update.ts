import {
  Action,
  Command,
  Ctx,
  Hears,
  Help,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import { BotService } from './bot.service';
import { MyContext } from './bot.context';
import { kalkulyatorOptions } from './kalkulyator-options';

@Update()
export class BootUpdate {
  constructor(private readonly botService: BotService) {}
  @Start()
  async onStart(@Ctx() ctx: MyContext) {
    await this.botService.start(ctx);
  }

  @Hears('Kanal')
  async onKanal(ctx: MyContext) {
    await this.botService.onKanal(ctx);
  }

  @Hears('Kalkulator')
  async onKalculator(ctx: MyContext) {
    await this.botService.onKalculator(ctx);
  }

  @Hears('⬅️ Ortga')
  async onBack(ctx: MyContext) {
    await this.botService.onBack(ctx);
  }

  @On('text')
  async onText(@Ctx() ctx: MyContext) {
    if ('text' in ctx.message) {
      const text = ctx.message.text;
      const companyNames = Object.values(kalkulyatorOptions).map((c) => c.name);

      if (companyNames.includes(text)) {
        await this.botService.onCompanySelected(ctx, text);
      } else if (ctx.session.selectedCompany) {
        await this.botService.onSumEntered(ctx, text);
      }
    }
  }
}
