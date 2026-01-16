import Logger from '../utils/Logger.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

class BackupSystem {
  constructor(client, config) {
    this.client = client;
    this.config = config;
    this.backupDir = './backups';
    
    // Créer le dossier de backup
    try {
      mkdirSync(this.backupDir, { recursive: true });
    } catch {}
  }

  async createBackup(guild) {
    if (!guild) return;

    try {
      const backup = {
        timestamp: new Date().toISOString(),
        guild: {
          id: guild.id,
          name: guild.name,
          icon: guild.iconURL(),
          roles: guild.roles.cache.map(role => ({
            id: role.id,
            name: role.name,
            color: role.color,
            permissions: role.permissions.toArray(),
            position: role.position
          })),
          channels: guild.channels.cache.map(channel => ({
            id: channel.id,
            name: channel.name,
            type: channel.type,
            parent: channel.parent?.id,
            position: channel.position,
            permissions: channel.permissionOverwrites.cache.map(overwrite => ({
              id: overwrite.id,
              type: overwrite.type,
              allow: overwrite.allow.toArray(),
              deny: overwrite.deny.toArray()
            }))
          })),
          members: guild.members.cache.map(member => ({
            id: member.id,
            username: member.user.username,
            roles: member.roles.cache.map(r => r.id)
          }))
        }
      };

      const filename = `backup_${guild.id}_${Date.now()}.json`;
      const filepath = join(this.backupDir, filename);
      
      writeFileSync(filepath, JSON.stringify(backup, null, 2));
      
      Logger.success(`Backup créé: ${filename}`);
      
      // Envoyer dans le channel de backup si configuré
      if (this.config.backupChannelId) {
        const backupChannel = this.client.channels.cache.get(this.config.backupChannelId);
        if (backupChannel) {
          await backupChannel.send({
            embeds: [{
              title: '💾 Backup Automatique',
              description: `Backup créé pour **${guild.name}**\n` +
                          `**Fichier:** ${filename}\n` +
                          `**Rôles:** ${backup.guild.roles.length}\n` +
                          `**Channels:** ${backup.guild.channels.length}`,
              color: 0x00ff00,
              timestamp: backup.timestamp
            }]
          });
        }
      }

      return backup;
    } catch (error) {
      Logger.error(`Erreur lors de la création du backup: ${error.message}`);
    }
  }

  async createBackupForAllGuilds() {
    // Créer un backup pour tous les serveurs
    for (const guild of this.client.guilds.cache.values()) {
      await this.createBackup(guild);
    }
  }
}

export default BackupSystem;
