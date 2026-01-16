import chalk from 'chalk';

class Logger {
  static info(message) {
    console.log(chalk.blue(`[INFO] ${new Date().toLocaleString()} - ${message}`));
  }

  static success(message) {
    console.log(chalk.green(`[SUCCESS] ${new Date().toLocaleString()} - ${message}`));
  }

  static warn(message) {
    console.log(chalk.yellow(`[WARN] ${new Date().toLocaleString()} - ${message}`));
  }

  static error(message) {
    console.error(chalk.red(`[ERROR] ${new Date().toLocaleString()} - ${message}`));
  }

  static security(message, severity = 'info') {
    const prefix = chalk.magenta('[SECURITY]');
    const timestamp = new Date().toLocaleString();
    
    switch (severity) {
      case 'critical':
        console.log(`${prefix} ${chalk.red(timestamp)} - ${chalk.red.bold(message)}`);
        break;
      case 'high':
        console.log(`${prefix} ${chalk.yellow(timestamp)} - ${chalk.yellow(message)}`);
        break;
      default:
        console.log(`${prefix} ${chalk.cyan(timestamp)} - ${message}`);
    }
  }
}

export default Logger;
