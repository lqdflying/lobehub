import { LobeAnthropicAI } from '../../providers/anthropic';
import { LobeAzureAI } from '../../providers/azureai';
import { LobeGoogleAI } from '../../providers/google';
import { LobeOpenAI } from '../../providers/openai';

export const baseRuntimeMap = {
  anthropic: LobeAnthropicAI,
  azure: LobeAzureAI,
  google: LobeGoogleAI,
  openai: LobeOpenAI,
};
