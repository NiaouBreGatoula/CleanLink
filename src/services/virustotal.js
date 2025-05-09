import fetch from 'node-fetch';
import FormData from 'form-data';
import { virustotalAPI } from '../config.js';

export async function scanUrlWithVirusTotal(url) {
  const submit = await fetch('https://www.virustotal.com/api/v3/urls', {
    method: 'POST',
    headers: {
      'x-apikey': virustotalAPI,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `url=${encodeURIComponent(url)}`
  });

  const submitData = await submit.json();
  const analysisId = submitData.data?.id;
  if (!analysisId) throw new Error('Failed to submit URL.');

  const result = await waitForCompletedResult(analysisId);
  return result.stats?.malicious ?? 0;
}

export async function lookupBySha256(sha256) {
  const url = `https://www.virustotal.com/api/v3/files/${sha256}`;
  const res = await fetch(url, {
    headers: { 'x-apikey': virustotalAPI }
  });

  if (res.status === 200) {
    const data = await res.json();
    const stats = data.data?.attributes?.last_analysis_stats;
    return stats ? { found: true, stats } : { found: true, stats: { malicious: 0 } };
  }

  return { found: false };
}

export async function uploadAndScanFile(buffer, filename) {
  const form = new FormData();
  form.append('file', buffer, filename);

  const response = await fetch('https://www.virustotal.com/api/v3/files', {
    method: 'POST',
    headers: {
      'x-apikey': virustotalAPI,
      ...form.getHeaders()
    },
    body: form
  });

  const data = await response.json();
  if (!data.data?.id) throw new Error('Upload failed: no analysis ID.');
  return data.data.id;
}

export async function waitForCompletedResult(id, timeout = 30000, interval = 3000) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const res = await fetch(`https://www.virustotal.com/api/v3/analyses/${id}`, {
      headers: { 'x-apikey': virustotalAPI }
    });

    const data = await res.json();
    const status = data.data?.attributes?.status;

    if (status === 'completed') {
      const stats = data.data?.attributes?.stats || {};
      const sha256 = data.meta?.file_info?.sha256 || 'unknown';
      return { stats, sha256 };
    }

    await new Promise(r => setTimeout(r, interval));
  }

  throw new Error('VirusTotal analysis timed out.');
}
