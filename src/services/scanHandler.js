import {
  scanUrlWithVirusTotal,
  lookupBySha256,
  uploadAndScanFile,
  waitForCompletedResult
} from './virustotal.js';

import { extractUrls } from '../utils/extractUrls.js';
import { hashBuffer } from '../utils/hash.js';
import { EmbedBuilder } from 'discord.js';
import { maliciousThreshold,bypassedRole } from '../config.js';
import fetch from 'node-fetch';

const scannedFiles = new Map();

export async function handleScanMessage(message) {
  if (message.member?.roles.cache.has(bypassedRole)) {
    return;
  }
  const urls = extractUrls(message.content);
  const hasFiles = message.attachments.size > 0;

  if (!hasFiles && urls.length === 0) return;

  const scanningMsg = await message.channel.send({
    content: 'Content is being scanned by CleanLink. Please do not interact yet.',
    allowedMentions: { repliedUser: false }
  });

  // 🔍 Scan URLs
  for (const url of urls) {
    const malicious = await scanUrlWithVirusTotal(url);
    if (malicious >= maliciousThreshold) {
      await message.delete();
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('Malicious URL Detected')
        .setDescription(`A link from <@${message.author.id}> was flagged.`)
        .addFields(
          { name: 'URL', value: url },
          { name: 'Malicious Detections', value: `${malicious}` }
        )
        .setFooter({ text: 'CleanLink Bot' })
        .setTimestamp();
      await scanningMsg.delete().catch(() => {});
      await message.channel.send({ embeds: [embed] });
      return;
    } else {
      await message.react('✅').catch(() => {});
    }
  }

  for (const attachment of message.attachments.values()) {
    const res = await fetch(attachment.url);
    const buffer = await res.buffer();
    const sha256 = hashBuffer(buffer);

    if (scannedFiles.has(sha256)) {
      const prev = scannedFiles.get(sha256);
      if (prev.malicious >= maliciousThreshold) {
        await message.delete();
        const embed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle('Previously flagged file detected')
          .setDescription(`A file from <@${message.author.id}> was blocked.`)
          .addFields(
            { name: 'Filename', value: attachment.name },
            { name: 'SHA256', value: sha256 },
            { name: 'Malicious Detections', value: `${prev.malicious}` }
          )
          .setFooter({ text: 'CleanLink Bot' })
          .setTimestamp();
        await scanningMsg.delete().catch(() => {});
        await message.channel.send({ embeds: [embed] });
        return;
      } else {
        await message.react('✅').catch(() => {});
        continue;
      }
    }

    let stats;
    const lookup = await lookupBySha256(sha256);

    if (lookup.found) {
      stats = lookup.stats;
    } else {
      const scanId = await uploadAndScanFile(buffer, attachment.name);
      const result = await waitForCompletedResult(scanId);
      stats = result.stats;
    }

    const malicious = stats?.malicious ?? 0;
    scannedFiles.set(sha256, { malicious });

    if (malicious >= maliciousThreshold) {
      await message.delete();
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('🚫 Malicious File Detected')
        .setDescription(`A file from <@${message.author.id}> was flagged.`)
        .addFields(
          { name: 'Filename', value: attachment.name || 'Unknown' },
          { name: 'SHA256', value: sha256 },
          { name: 'Malicious Detections', value: `${malicious}` }
        )
        .setFooter({ text: 'CleanLink Bot' })
        .setTimestamp();
      await scanningMsg.delete().catch(() => {});
      await message.channel.send({ embeds: [embed] });
      return;
    } else {
      await message.react('✅').catch(() => {});
    }
  }

  await scanningMsg.delete().catch(() => {});
}
