import chalk from "chalk";

// Force color support for better terminal compatibility
if (process.env.NODE_ENV !== 'test') {
  chalk.level = 3; // Force truecolor support
}

/**
 * PoD Protocol CLI Branding and Visual Elements
 */

// Revert to original working banner
export const POD_BANNER = `
${chalk.magenta.bold('██████╗  ██████╗ ██████╗     ██████╗ ██████╗  ██████╗ ████████╗ ██████╗  ██████╗ ██████╗ ██╗     ')}
${chalk.magenta.bold('██╔══██╗██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔═══██╗╚══██╔══╝██╔═══██╗██╔════╝██╔═══██╗██║     ')}
${chalk.magenta.bold('██████╔╝██║   ██║██║  ██║    ██████╔╝██████╔╝██║   ██║   ██║   ██║   ██║██║     ██║   ██║██║     ')}
${chalk.magenta.bold('██╔═══╝ ██║   ██║██║  ██║    ██╔═══╝ ██╔══██╗██║   ██║   ██║   ██║   ██║██║     ██║   ██║██║     ')}
${chalk.magenta.bold('██║     ╚██████╔╝██████╔╝    ██║     ██║  ██║╚██████╔╝   ██║   ╚██████╔╝╚██████╗╚██████╔╝███████╗')}
${chalk.magenta.bold('╚═╝      ╚═════╝ ╚═════╝     ╚═╝     ╚═╝  ╚═╝ ╚═════╝    ╚═╝    ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝')}

${chalk.cyan.bold('                    The Ultimate AI Agent Communication Protocol')}
${chalk.gray('                          Where prompts become prophecy ⚡️')}
`;

// Beautiful "Prompt or Die" banner with enhanced styling
export const PROMPT_OR_DIE_BANNER = `
${chalk.gray('╔═══════════════════════════════════════════════════════════════════════════════╗')}
${chalk.gray('║')} ${chalk.magenta.bold('██████╗ ██████╗  ██████╗ ███╗   ███╗██████╗ ████████╗')} ${chalk.white.bold('  ██████╗ ██████╗ ')} ${chalk.gray('║')}
${chalk.gray('║')} ${chalk.magenta.bold('██╔══██╗██╔══██╗██╔═══██╗████╗ ████║██╔══██╗╚══██╔══╝')} ${chalk.white.bold(' ██╔═══██╗██╔══██╗')} ${chalk.gray('║')}
${chalk.gray('║')} ${chalk.magenta.bold('██████╔╝██████╔╝██║   ██║██╔████╔██║██████╔╝   ██║   ')} ${chalk.white.bold(' ██║   ██║██████╔╝')} ${chalk.gray('║')}
${chalk.gray('║')} ${chalk.magenta.bold('██╔═══╝ ██╔══██╗██║   ██║██║╚██╔╝██║██╔═══╝    ██║   ')} ${chalk.white.bold(' ██║   ██║██╔══██╗')} ${chalk.gray('║')}
${chalk.gray('║')} ${chalk.magenta.bold('██║     ██║  ██║╚██████╔╝██║ ╚═╝ ██║██║        ██║   ')} ${chalk.white.bold(' ╚██████╔╝██║  ██║')} ${chalk.gray('║')}
${chalk.gray('║')} ${chalk.magenta.bold('╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝        ╚═╝   ')} ${chalk.white.bold('  ╚═════╝ ╚═╝  ╚═╝')} ${chalk.gray('║')}
${chalk.gray('║')}                                                                               ${chalk.gray('║')}
${chalk.gray('║')} ${chalk.magenta.bold('    ███████╗██╗██╗     ██╗')} ${chalk.white.bold('███████╗    ██████╗ ██╗███████╗    ')} ${chalk.gray('║')}
${chalk.gray('║')} ${chalk.magenta.bold('    ██╔═════╝██║██║     ██║')} ${chalk.white.bold('██╔════╝    ██╔══██╗██║██╔════╝    ')} ${chalk.gray('║')}
${chalk.gray('║')} ${chalk.magenta.bold('    █████╗  ██║██║     ██║')} ${chalk.white.bold('█████╗      ██║  ██║██║█████╗      ')} ${chalk.gray('║')}
${chalk.gray('║')} ${chalk.magenta.bold('    ██╔══╝  ██║██║     ██║')} ${chalk.white.bold('██╔══╝      ██║  ██║██║██╔══╝      ')} ${chalk.gray('║')}
${chalk.gray('║')} ${chalk.magenta.bold('    ███████╗██║███████╗██║')} ${chalk.white.bold('███████╗    ██████╔╝██║███████╗    ')} ${chalk.gray('║')}
${chalk.gray('║')} ${chalk.magenta.bold('    ╚══════╝╚═╝╚══════╝╚═╝')} ${chalk.white.bold('╚══════╝    ╚═════╝ ╚═╝╚══════╝    ')} ${chalk.gray('║')}
${chalk.gray('║')}                                                                               ${chalk.gray('║')}
${chalk.gray('║')} ${chalk.cyan.bold('                    Where AI agents meet their destiny ⚡️                  ')} ${chalk.gray('║')}
${chalk.gray('╚═══════════════════════════════════════════════════════════════════════════════╝')}
`;

// Compact "Prompt or Die" banner
export const PROMPT_OR_DIE_COMPACT = `
${chalk.magenta.bold('PROMPT')} ${chalk.white.bold('or')} ${chalk.red.bold('DIE')} ${chalk.yellow('⚡️')}
${chalk.cyan('──────────────────────────────')}
`;

// Ultra-compact one-liner
export const PROMPT_OR_DIE_MINI = `${chalk.magenta('[')} ${chalk.magenta.bold('PROMPT')} ${chalk.white('or')} ${chalk.red.bold('DIE')} ${chalk.magenta(']')} ${chalk.yellow('⚡')}`;

// Revert to original mini logo
export const POD_MINI_LOGO = `${chalk.magenta.bold('⚡️ PoD')} ${chalk.cyan('Protocol')}`;

// Simple command banners using working colors
export const COMMAND_BANNERS = {
  agent: `${chalk.magenta('▄▄▄')} ${chalk.cyan.bold('🤖 AGENT COMMAND')} ${chalk.magenta('▄▄▄')}`,
  message: `${chalk.magenta('▄▄▄')} ${chalk.cyan.bold('💬 MESSAGE COMMAND')} ${chalk.magenta('▄▄▄')}`,
  channel: `${chalk.magenta('▄▄▄')} ${chalk.cyan.bold('🏛️ CHANNEL COMMAND')} ${chalk.magenta('▄▄▄')}`,
  escrow: `${chalk.magenta('▄▄▄')} ${chalk.cyan.bold('💰 ESCROW COMMAND')} ${chalk.magenta('▄▄▄')}`,
  config: `${chalk.magenta('▄▄▄')} ${chalk.cyan.bold('⚙️ CONFIG COMMAND')} ${chalk.magenta('▄▄▄')}`,
  status: `${chalk.magenta('▄▄▄')} ${chalk.cyan.bold('🛡️ STATUS CHECK')} ${chalk.magenta('▄▄▄')}`
};

// Simple decorative elements using working colors
export const DECORATIVE_ELEMENTS = {
  starBorder: `${chalk.yellow('✧')} ${chalk.magenta('─'.repeat(50))} ${chalk.yellow('✧')}`,
  gemBorder: `${chalk.cyan('◆')} ${chalk.magenta('─'.repeat(48))} ${chalk.cyan('◆')}`,
  lightningBorder: `${chalk.yellow('⚡')} ${chalk.magenta('━'.repeat(48))} ${chalk.yellow('⚡')}`,
  violetGradient: chalk.magenta('▓'.repeat(50))
};

// Banner size options
export enum BannerSize {
  FULL = 'full',
  COMPACT = 'compact', 
  MINI = 'mini',
  NONE = 'none'
}

export const BRAND_COLORS = {
  primary: chalk.magenta,
  secondary: chalk.cyan,
  success: chalk.green,
  warning: chalk.yellow,
  error: chalk.red,
  info: chalk.blue,
  muted: chalk.gray,
  accent: chalk.white.bold,
  dim: chalk.dim,
} as const;

export const ICONS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  loading: '⏳',
  agent: '🤖',
  message: '💬',
  channel: '🏛️',
  escrow: '💰',
  network: '🌐',
  key: '🔑',
  rocket: '🚀',
  lightning: '⚡️',
  shield: '🛡️',
  gear: '⚙️',
  search: '🔍',
  bell: '🔔',
  star: '⭐',
  fire: '🔥',
  gem: '💎',
  chain: '⛓️',
} as const;

export const DIVIDERS = {
  thin: chalk.gray('─'.repeat(60)),
  thick: chalk.gray('═'.repeat(60)),
  fancy: chalk.magenta('▓'.repeat(60)),
  dots: chalk.dim('·'.repeat(60)),
} as const;

/**
 * Display the original working banner
 */
export function showBanner(size: BannerSize = BannerSize.FULL): void {
  switch (size) {
    case BannerSize.FULL:
      console.log(POD_BANNER);
      console.log(DIVIDERS.thin);
      break;
    case BannerSize.COMPACT:
      console.log(PROMPT_OR_DIE_COMPACT);
      console.log(DIVIDERS.dots);
      break;
    case BannerSize.MINI:
      console.log(PROMPT_OR_DIE_MINI);
      break;
    case BannerSize.NONE:
      return;
  }
  console.log();
}

/**
 * Display the beautiful "Prompt or Die" banner
 */
export function showPromptOrDieBanner(): void {
  console.log(PROMPT_OR_DIE_BANNER);
  console.log(DECORATIVE_ELEMENTS.lightningBorder);
  console.log();
}

/**
 * Display a compact header for commands
 */
export function showMiniHeader(command?: string): void {
  if (command && COMMAND_BANNERS[command as keyof typeof COMMAND_BANNERS]) {
    console.log(COMMAND_BANNERS[command as keyof typeof COMMAND_BANNERS]);
    console.log(DECORATIVE_ELEMENTS.starBorder);
  } else {
    const header = command 
      ? `${POD_MINI_LOGO} ${chalk.gray('›')} ${chalk.cyan.bold(command)}`
      : POD_MINI_LOGO;
    console.log(header);
    console.log(DIVIDERS.dots);
  }
  console.log();
}

/**
 * Display command-specific decorative header
 */
export function showCommandHeader(command: string, subtitle?: string): void {
  const commandBanner = COMMAND_BANNERS[command as keyof typeof COMMAND_BANNERS];
  if (commandBanner) {
    console.log(commandBanner);
    if (subtitle) {
      console.log(`${chalk.magenta('│')} ${chalk.white(subtitle)} ${chalk.magenta('│')}`);
    }
    console.log(chalk.magenta('▀'.repeat(30)));
  } else {
    showMiniHeader(command);
  }
  console.log();
}

/**
 * Format a section header
 */
export function sectionHeader(title: string, icon?: string): string {
  const prefix = icon ? `${icon} ` : '';
  return `${prefix}${BRAND_COLORS.accent(title)}`;
}

/**
 * Format a status message with appropriate styling
 */
export function statusMessage(
  type: 'success' | 'error' | 'warning' | 'info',
  message: string,
  details?: string
): string {
  const color = BRAND_COLORS[type];
  const icon = ICONS[type];
  
  let output = `${icon} ${color(message)}`;
  if (details) {
    output += `\n   ${BRAND_COLORS.dim(details)}`;
  }
  
  return output;
}

/**
 * Format a progress indicator
 */
export function progressIndicator(step: number, total: number, message: string): string {
  const percentage = Math.round((step / total) * 100);
  const progressBar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
  
  return `${ICONS.loading} ${BRAND_COLORS.info(`[${step}/${total}]`)} ${progressBar} ${percentage}%\n   ${message}`;
}

/**
 * Format a key-value pair for display
 */
export function keyValue(key: string, value: string | number, icon?: string): string {
  const prefix = icon ? `${icon} ` : '';
  return `${prefix}${BRAND_COLORS.accent(key)}: ${BRAND_COLORS.secondary(value.toString())}`;
}

/**
 * Create a bordered box for important information
 */
export function infoBox(title: string, content: string[], type: 'info' | 'warning' | 'error' = 'info'): string {
  const color = BRAND_COLORS[type];
  const icon = ICONS[type];
  
  const maxWidth = Math.max(title.length, ...content.map(line => line.length)) + 4;
  const border = '─'.repeat(maxWidth);
  
  let box = `${color('┌' + border + '┐')}\n`;
  box += `${color('│')} ${icon} ${color.bold(title)}${' '.repeat(maxWidth - title.length - 2)} ${color('│')}\n`;
  box += `${color('├' + border + '┤')}\n`;
  
  content.forEach(line => {
    box += `${color('│')} ${line}${' '.repeat(maxWidth - line.length - 1)} ${color('│')}\n`;
  });
  
  box += `${color('└' + border + '┘')}`;
  
  return box;
}

/**
 * Format command usage examples
 */
export function commandExample(command: string, description: string): string {
  return `${BRAND_COLORS.muted('$')} ${BRAND_COLORS.accent(command)}\n  ${BRAND_COLORS.dim(description)}`;
}

/**
 * Create a branded spinner message
 */
export function spinnerMessage(message: string): string {
  return `${ICONS.loading} ${BRAND_COLORS.info(message)}`;
}