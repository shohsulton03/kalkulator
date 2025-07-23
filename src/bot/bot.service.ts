import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { BOT_NAME } from './app.constants';
import { Telegraf } from 'telegraf';
import { Markup } from 'telegraf';
import { kalkulyatorOptions } from './kalkulyator-options';
import { MyContext } from './bot.context';

@Injectable()
export class BotService {
  constructor(@InjectBot(BOT_NAME) private bot: Telegraf<MyContext>) {}

  async start(ctx: MyContext) {
    await ctx.reply(
      'Assalomu alaykum, BUYSENSE kalkulyatoriga xush kelibsiz!',
      {
        parse_mode: 'HTML',
        ...Markup.keyboard([['Kanal', 'Kalkulator']]).resize(),
      },
    );
  }

  async onKanal(ctx: MyContext) {
    await ctx.reply(`${process.env.KANAL_LINK}`);
  }

  async onKalculator(ctx: MyContext) {
    const options = Object.values(kalkulyatorOptions);

    if (options.length === 1) {
      const company = options[0];
      ctx.session.selectedCompany = company.name;
      await ctx.reply('Summani kiriting:', {
        reply_markup: { remove_keyboard: true },
      });
      return;
    }

    const buttons = options.map((item) => [item.name]);
    await ctx.reply(
      'Hamkorni tanlang:',
      Markup.keyboard([...buttons, ['⬅️ Ortga']]).resize(),
    );
  }

  async onCompanySelected(ctx: MyContext, companyName: string) {
    ctx.session.selectedCompany = companyName;
    await ctx.reply('Summani kiriting:');
  }

  async onBack(ctx: MyContext) {
    await ctx.reply("Bosh menu", {
      parse_mode: 'HTML',
      ...Markup.keyboard([['Kanal', 'Kalkulator']]).resize(),
    });
  }

  async onSumEntered(ctx: MyContext, sumText: string) {
    const sum = parseFloat(sumText.replace(/\s/g, ''));
    const companyKey = Object.keys(kalkulyatorOptions).find(
      (key) => kalkulyatorOptions[key].name === ctx.session.selectedCompany,
    );

    if (!companyKey || isNaN(sum)) {
      await ctx.reply('Noto‘g‘ri maʼlumot. Iltimos, son kiriting.');
      return;
    }

    const company = kalkulyatorOptions[companyKey];

    let extraPercent = 0;
    if (sum <= 3_000_000) extraPercent = 21;
    else if (sum <= 8_000_000) extraPercent = 16;
    else extraPercent = 11;

    const baseTotal = sum + (sum * extraPercent) / 100;

    let result = `<b>${company.name}</b> uchun hisob-kitob:\n`;

    for (const [month, percentStr] of Object.entries(company.rates)) {
      const percent = Number(percentStr);
      const total = baseTotal + (baseTotal * percent) / 100;
      const monthly = total / parseInt(month);

      const formatted = new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(monthly);

      result += `${month} oy: ${formatted} so‘mdan\n`;
    }


    await ctx.reply(result, { parse_mode: 'HTML' });

    const companyCount = Object.keys(kalkulyatorOptions).length;

    if (companyCount === 1) {
      await ctx.reply(
        'Summani kiriting:',
        Markup.keyboard([['⬅️ Ortga']]).resize(),
      );
    } else {
      await ctx.reply('Summani kiriting:');
    }
  }
}
