import { Context } from 'telegraf';

export interface SessionData {
  selectedCompany?: string;
}

export interface MyContext extends Context {
  session: SessionData;
}
